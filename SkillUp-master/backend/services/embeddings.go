package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"skillup-backend/config"

	"github.com/pgvector/pgvector-go"
)

// Gemini embedding request structure
type geminiEmbedReq struct {
	Content  content `json:"content"`
	TaskType string  `json:"taskType,omitempty"`
}

type content struct {
	Parts []part `json:"parts"`
}

type part struct {
	Text string `json:"text"`
}

// Gemini embedding response structure
type geminiEmbedResp struct {
	Embedding struct {
		Values []float32 `json:"values"`
	} `json:"embedding"`
}

// GetEmbedding generates embedding vector using Gemini API
// taskType: "RETRIEVAL_DOCUMENT" for documents, "RETRIEVAL_QUERY" for queries
func GetEmbedding(input string) pgvector.Vector {
	if input == "" {
		return pgvector.NewVector([]float32{})
	}

	// Build Gemini API request
	reqBody := geminiEmbedReq{
		Content: content{
			Parts: []part{{Text: input}},
		},
		// TaskType is optional - omit for simplicity
	}

	b, err := json.Marshal(reqBody)
	if err != nil {
		return pgvector.NewVector([]float32{})
	}

	// Call Gemini embedding API
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:embedContent?key=%s",
		config.AppConfig.EMBED_MODEL, config.AppConfig.GEMINI_API_KEY)
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(b))
	if err != nil {
		return pgvector.NewVector([]float32{})
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return pgvector.NewVector([]float32{})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return pgvector.NewVector([]float32{})
	}

	var out geminiEmbedResp
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return pgvector.NewVector([]float32{})
	}

	if len(out.Embedding.Values) == 0 {
		return pgvector.NewVector([]float32{})
	}

	return pgvector.NewVector(out.Embedding.Values)
}

// ChunkText splits text into chunks for embedding
func ChunkText(text string) []string {
	chunkSize := 1500 // characters, not tokens
	runes := []rune(text)
	var chunks []string

	for i := 0; i < len(runes); i += chunkSize {
		j := i + chunkSize
		if j > len(runes) {
			j = len(runes)
		}
		chunks = append(chunks, string(runes[i:j]))
	}
	return chunks
}

