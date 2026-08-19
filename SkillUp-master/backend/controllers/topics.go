package controllers

import (
	"net/http"
	"skillup-backend/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetTopics(c *gin.Context) {
	userId := c.GetString("user_id")
	var topics []db.Topic
	db.DB.Where("user_id = ?", userId).Find(&topics)
	c.JSON(http.StatusOK, topics)
}

func CreateTopic(c *gin.Context) {
	userId := c.GetString("user_id")
	var body struct {
		Title    string  `json:"title"`
		GoalID   *string `json:"goal_id"`
		ParentID *string `json:"parent_id"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	t := db.Topic{
		ID:       uuid.NewString(),
		UserID:   userId,
		Title:    body.Title,
		GoalID:   body.GoalID,
		ParentID: body.ParentID,
	}
	db.DB.Create(&t)
	c.JSON(http.StatusOK, t)
}
