package routes

import (
	"github.com/gin-gonic/gin"
	"skillup-backend/controllers"
	"skillup-backend/middleware"
)

func SetupRoutes(r *gin.Engine) {
	// Public routes (no auth required)
	r.POST("/api/auth/signup", controllers.Signup)
	r.POST("/api/auth/login", controllers.Login)

	// Protected routes (auth required)
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())

	// Goals
	api.GET("/goals", controllers.GetGoals)
	api.POST("/goals", controllers.CreateGoal)

	// Documents & PDF ingestion
	api.POST("/documents/upload", controllers.UploadDocument)
	api.GET("/documents", controllers.GetDocuments)
	api.GET("/documents/:document_id", controllers.GetDocument)
	api.GET("/documents/:document_id/file", controllers.GetDocumentFile)
	api.POST("/documents/:document_id/summarize", controllers.SummarizeDocument)

	// Chat (RAG)
	api.POST("/chat/query", controllers.ChatQuery)

	// Quizzes (NEW - document-based)
	api.POST("/quizzes/generate/:document_id", controllers.GenerateQuiz)
	api.GET("/quizzes/:quiz_id", controllers.GetQuiz)
	api.POST("/quizzes/:quiz_id/submit", controllers.SubmitQuiz)
	api.GET("/quizzes/document/:document_id", controllers.GetDocumentQuizzes)
	api.GET("/quizzes", controllers.GetQuizzes)

	// DEPRECATED ROUTES (keep for backward compatibility, but mark as legacy)
	// These routes are kept but should not be enhanced
	api.GET("/topics", controllers.GetTopics)           // DEPRECATED
	api.POST("/topics", controllers.CreateTopic)        // DEPRECATED
	api.POST("/activity", controllers.CreateActivity)   // DEPRECATED
	api.GET("/activity", controllers.GetActivity)       // DEPRECATED
}
