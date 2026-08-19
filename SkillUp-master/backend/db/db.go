package db

import (
	"log"
	"skillup-backend/config"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
)

var DB *gorm.DB

func Connect(){
	dsn:= config.AppConfig.DB_URL

	drv:= postgres.New(postgres.Config{
		DSN: dsn,
	})

	var err error

	DB, err = gorm.Open(drv, &gorm.Config{})
	if err !=nil{
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS vector;").Error; err != nil {
		log.Println("warning: couldn't create pgvector extension:", err)
	}

	Migrate()
}

func Migrate() {
	if err := DB.AutoMigrate(
		&User{},
		&Goal{},
		&Topic{},
		&Document{},
		&DocumentRaw{},
		&DocumentChunk{},
		&Quiz{},
		&StudyActivity{},
		&ChatMessage{},
	); err != nil {
		log.Fatal("migration failed:", err)
	}
}

func GetDB() *gorm.DB {
	return DB
}

func Close() {
	if DB != nil {
		db, err := DB.DB()
		if err != nil {
			log.Fatalf("Failed to get database connection: %v", err)
		}
		db.Close()
	}
}