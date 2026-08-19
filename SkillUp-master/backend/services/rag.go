package services

import (
	"fmt"
	"skillup-backend/db"
	"strings"
)

// BuildContextFromChunks combines document chunks into context string
func BuildContextFromChunks(chunks []db.DocumentChunk) string {
	var parts []string
	for _, c := range chunks {
		parts = append(parts, c.ChunkText)
	}
	return strings.Join(parts, "\n\n---\n\n")
}

// RAGAnswer generates answer using RAG (Retrieval Augmented Generation)
func RAGAnswer(question, context string) string {
	prompt := fmt.Sprintf(`You are a helpful study assistant. Use ONLY the context below (do not hallucinate).

Context:

%s

Question: %s

Answer concisely. If sources are relevant, mention them.`, context, question)

	return LLM(prompt)
}

