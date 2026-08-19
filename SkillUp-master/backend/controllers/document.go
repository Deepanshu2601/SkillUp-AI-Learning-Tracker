package controllers

import (
	"net/http"
	"skillup-backend/db"
	"skillup-backend/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UploadDocument accepts multipart form "file"
func UploadDocument(c *gin.Context) {
	userId := c.GetString("user_id")

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing file"})
		return
	}
	defer file.Close()

	data, err := services.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read file"})
		return
	}

	doc := db.Document{
		ID:       uuid.NewString(),
		UserID:   userId,
		Filename: header.Filename,
	}
	db.DB.Create(&doc)

	// Extract text synchronously (MVP)
	text := services.PDFToText(data)

	raw := db.DocumentRaw{
		ID:         uuid.NewString(),
		DocumentID: doc.ID,
		UserID:     userId,
		Text:       text,
		FileData:   data, // Store original PDF
	}
	db.DB.Create(&raw)

	// Chunk + embed + store
	chunks := services.ChunkText(text)
	for _, ch := range chunks {
		emb := services.GetEmbedding(ch)
		db.DB.Create(&db.DocumentChunk{
			ID:         uuid.NewString(),
			DocumentID: doc.ID,
			UserID:     userId,
			ChunkText:  ch,
			Embedding:  emb,
		})
	}

	// mark processed
	doc.ProcessingStatus = "processed"
	db.DB.Save(&doc)

	c.JSON(http.StatusOK, gin.H{"status": "ok", "document_id": doc.ID})
}

func GetDocuments(c *gin.Context) {
	userId := c.GetString("user_id")
	var docs []db.Document
	db.DB.Where("user_id = ?", userId).Order("upload_date desc").Find(&docs)
	c.JSON(http.StatusOK, docs)
}

// GetDocument retrieves a single document with summary
func GetDocument(c *gin.Context) {
	userId := c.GetString("user_id")
	documentId := c.Param("document_id")

	var doc db.Document
	if err := db.DB.Where("id = ? AND user_id = ?", documentId, userId).First(&doc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	c.JSON(http.StatusOK, doc)
}

// SummarizeDocument generates a summary for a document
func SummarizeDocument(c *gin.Context) {
	userId := c.GetString("user_id")
	documentId := c.Param("document_id")

	// Parse options from body (optional)
	var options services.SummaryOptions
	if err := c.BindJSON(&options); err != nil {
		// Use defaults if no body provided
		options = services.SummaryOptions{
			Length: "medium",
			Style:  "paragraph",
		}
	}

	// Fetch document
	var doc db.Document
	if err := db.DB.Where("id = ? AND user_id = ?", documentId, userId).First(&doc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Check if document is processed
	if doc.ProcessingStatus != "processed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "document is not yet processed"})
		return
	}

	// Fetch document text
	var docRaw db.DocumentRaw
	if err := db.DB.Where("document_id = ?", documentId).First(&docRaw).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "document text not found"})
		return
	}

	// Generate summary using LLM
	summary, err := services.SummarizeDocument(docRaw.Text, options)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate summary: " + err.Error()})
		return
	}

	// Update document with summary
	now := time.Now()
	doc.Summary = summary
	doc.SummaryGeneratedAt = &now

	if err := db.DB.Save(&doc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save summary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"summary":     summary,
		"document_id": documentId,
		"generated_at": now,
	})
}

// GetDocumentFile serves the original PDF file
func GetDocumentFile(c *gin.Context) {
	userId := c.GetString("user_id")
	documentId := c.Param("document_id")

	// Verify document belongs to user
	var doc db.Document
	if err := db.DB.Where("id = ? AND user_id = ?", documentId, userId).First(&doc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Fetch document file data
	var docRaw db.DocumentRaw
	if err := db.DB.Where("document_id = ?", documentId).First(&docRaw).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document file not found"})
		return
	}

	if len(docRaw.FileData) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "document file data not available"})
		return
	}

	// Serve the PDF file
	c.Data(http.StatusOK, "application/pdf", docRaw.FileData)
}
