package controllers

import (
	"encoding/json"
	"net/http"
	"skillup-backend/db"
	"skillup-backend/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GenerateQuiz generates a quiz from a document using LLM
func GenerateQuiz(c *gin.Context) {
	userId := c.GetString("user_id")
	documentId := c.Param("document_id")

	// Parse config from body (optional)
	var config services.QuizConfig
	if err := c.BindJSON(&config); err != nil {
		// Use defaults if no body provided
		config = services.QuizConfig{
			NumQuestions: 10,
			Difficulty:   "medium",
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

	// Generate quiz using LLM
	questions, err := services.GenerateQuizFromDocument(docRaw.Text, config)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate quiz: " + err.Error()})
		return
	}

	// Convert questions to JSON
	questionsJSON, err := json.Marshal(questions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to serialize questions"})
		return
	}

	// Create quiz record
	quiz := db.Quiz{
		ID:             uuid.NewString(),
		UserID:         userId,
		DocumentID:     documentId,
		Questions:      questionsJSON,
		TotalQuestions: len(questions),
		Status:         "generated",
	}

	if err := db.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save quiz"})
		return
	}

	// Return quiz without correct answers for frontend
	questionsForUser := make([]map[string]interface{}, len(questions))
	for i, q := range questions {
		questionsForUser[i] = map[string]interface{}{
			"id":       q.ID,
			"question": q.Question,
			"options":  q.Options,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":              quiz.ID,
		"document_id":     quiz.DocumentID,
		"questions":       questionsForUser,
		"total_questions": quiz.TotalQuestions,
		"status":          quiz.Status,
	})
}

// GetQuiz retrieves a specific quiz
func GetQuiz(c *gin.Context) {
	userId := c.GetString("user_id")
	quizId := c.Param("quiz_id")

	var quiz db.Quiz
	if err := db.DB.Where("id = ? AND user_id = ?", quizId, userId).First(&quiz).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "quiz not found"})
		return
	}

	// Parse questions
	var questions []services.Question
	if err := json.Unmarshal([]byte(quiz.Questions), &questions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse questions"})
		return
	}

	// If quiz not submitted, hide correct answers
	if quiz.Status != "submitted" {
		questionsForUser := make([]map[string]interface{}, len(questions))
		for i, q := range questions {
			questionsForUser[i] = map[string]interface{}{
				"id":       q.ID,
				"question": q.Question,
				"options":  q.Options,
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"id":              quiz.ID,
			"document_id":     quiz.DocumentID,
			"questions":       questionsForUser,
			"total_questions": quiz.TotalQuestions,
			"status":          quiz.Status,
		})
		return
	}

	// If submitted, return full quiz with scores
	c.JSON(http.StatusOK, quiz)
}

// SubmitQuiz submits user answers and calculates score
func SubmitQuiz(c *gin.Context) {
	userId := c.GetString("user_id")
	quizId := c.Param("quiz_id")

	var body struct {
		Answers []services.UserAnswer `json:"answers"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// Fetch quiz
	var quiz db.Quiz
	if err := db.DB.Where("id = ? AND user_id = ?", quizId, userId).First(&quiz).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "quiz not found"})
		return
	}

	// Check if already submitted
	if quiz.Status == "submitted" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "quiz already submitted"})
		return
	}

	// Parse questions
	var questions []services.Question
	if err := json.Unmarshal(quiz.Questions, &questions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse questions"})
		return
	}

	// Calculate score
	score, feedback := services.CalculateQuizScore(questions, body.Answers)

	// Save user answers
	answersJSON, err := json.Marshal(body.Answers)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save answers"})
		return
	}

	// Update quiz
	now := time.Now()
	quiz.Score = &score
	quiz.UserAnswers = answersJSON
	quiz.Status = "submitted"
	quiz.AttemptedAt = &now

	if err := db.DB.Save(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update quiz"})
		return
	}

	// Return results
	c.JSON(http.StatusOK, gin.H{
		"score":           score,
		"total_questions": quiz.TotalQuestions,
		"percentage":      score,
		"feedback":        feedback,
		"quiz_id":         quiz.ID,
	})
}

// GetQuizzes retrieves all quizzes for the user
func GetQuizzes(c *gin.Context) {
	userId := c.GetString("user_id")
	documentId := c.Query("document_id") // Optional filter

	query := db.DB.Where("user_id = ?", userId)
	
	if documentId != "" {
		query = query.Where("document_id = ?", documentId)
	}

	var quizzes []db.Quiz
	query.Order("created_at desc").Limit(50).Find(&quizzes)

	c.JSON(http.StatusOK, quizzes)
}

// GetDocumentQuizzes retrieves all quizzes for a specific document
func GetDocumentQuizzes(c *gin.Context) {
	userId := c.GetString("user_id")
	documentId := c.Param("document_id")

	var quizzes []db.Quiz
	db.DB.Where("user_id = ? AND document_id = ?", userId, documentId).
		Order("created_at desc").
		Find(&quizzes)

	c.JSON(http.StatusOK, quizzes)
}
