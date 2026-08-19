package controllers

import (
	"net/http"
	"skillup-backend/db"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateActivity(c *gin.Context) {
	userId := c.GetString("user_id")
	var body struct {
		TopicID        *string `json:"topic_id"`
		ActivityType   string  `json:"activity_type"`
		DurationMinutes int    `json:"duration_minutes"`
		Data           string  `json:"data"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	act := db.StudyActivity{
		ID:              uuid.NewString(),
		UserID:          userId,
		TopicID:         body.TopicID,
		ActivityType:    body.ActivityType,
		DurationMinutes: body.DurationMinutes,
		Data:            body.Data,
		CreatedAt:       time.Now(),
	}
	db.DB.Create(&act)
	c.JSON(http.StatusOK, act)
}

func GetActivity(c *gin.Context) {
	userId := c.GetString("user_id")
	var activities []db.StudyActivity
	db.DB.Where("user_id = ?", userId).Order("created_at desc").Limit(50).Find(&activities)
	c.JSON(http.StatusOK, activities)
}
