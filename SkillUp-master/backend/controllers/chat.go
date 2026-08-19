package controllers

import (
	"net/http"
	"skillup-backend/db"
	"skillup-backend/services"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ChatQuery(c *gin.Context) {
	userId := c.GetString("user_id")
	var body struct {
		Query string `json:"query"`
	}
	if err := c.BindJSON(&body); err != nil || strings.TrimSpace(body.Query) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid query"})
		return
	}

	// embed query
	qEmb := services.GetEmbedding(body.Query)

	// vector search in document_chunks for this user
	var chunks []db.DocumentChunk
	// NOTE: we use raw SQL ordering by distance using pgvector operator <->.
	// GORM will map the param qEmb; pgvector-go implements driver.Valuer to pass vector.
	db.DB.Raw(`
		SELECT * FROM document_chunks
		WHERE user_id = ?
		ORDER BY embedding <-> ?
		LIMIT 5`, userId, qEmb).Scan(&chunks)

	context := services.BuildContextFromChunks(chunks)

	// ask LLM
	answer := services.RAGAnswer(body.Query, context)

	// store chat
	msg := db.ChatMessage{
		ID:       uuid.NewString(),
		UserID:   userId,
		Question: body.Query,
		Answer:   answer,
	}
	db.DB.Create(&msg)

	c.JSON(http.StatusOK, gin.H{
		"answer": answer,
	})
}
