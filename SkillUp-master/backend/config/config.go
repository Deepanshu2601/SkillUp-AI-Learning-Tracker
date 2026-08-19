package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DB_URL     string
	JWT_SECRET string
	GEMINI_API_KEY string
	GEMINI_MODEL   string
	EMBED_MODEL string
}

var AppConfig Config

func LoadConfig() {
	_ = godotenv.Load()

	AppConfig = Config{
		DB_URL:         os.Getenv("DATABASE_URL"),
		JWT_SECRET:     os.Getenv("JWT_SECRET"),
		GEMINI_API_KEY: os.Getenv("GEMINI_API_KEY"),
		GEMINI_MODEL:   os.Getenv("GEMINI_MODEL"),
		EMBED_MODEL:    os.Getenv("EMBED_MODEL"),
	}

	if AppConfig.DB_URL == "" {
		log.Fatal("DATABASE_URL is missing")
	}
	if AppConfig.JWT_SECRET == "" {
		log.Println("Warning: JWT_SECRET not set — Auth will break")
	}
	if AppConfig.GEMINI_API_KEY == "" {
		log.Println("Warning: GEMINI_API_KEY not set — Gemini calls will fail")
	}
}
