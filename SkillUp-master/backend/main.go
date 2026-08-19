package main

import (
	"log"
	"skillup-backend/config"
	"skillup-backend/db"
	"skillup-backend/middleware"
	"skillup-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	db.Connect()
	defer db.Close()

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(middleware.CORSMiddleware())

	// Setup routes
	routes.SetupRoutes(r)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

