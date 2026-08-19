package services

import (
	"fmt"
)

// SummaryOptions represents options for document summarization
type SummaryOptions struct {
	Length string `json:"length"` // short/medium/long
	Style  string `json:"style"`  // bullet_points/paragraph/key_points
}

// SummarizeDocument generates a summary of document text using LLM
func SummarizeDocument(text string, options SummaryOptions) (string, error) {
	if text == "" {
		return "", fmt.Errorf("document text is empty")
	}

	// Default options
	if options.Length == "" {
		options.Length = "medium"
	}
	if options.Style == "" {
		options.Style = "paragraph"
	}

	// Determine word count based on length
	wordCount := map[string]string{
		"short":  "100-150 words",
		"medium": "200-300 words",
		"long":   "400-500 words",
	}

	targetLength := wordCount[options.Length]
	if targetLength == "" {
		targetLength = "200-300 words"
	}

	// Truncate text if too long
	maxChars := 10000
	if len(text) > maxChars {
		text = text[:maxChars] + "..."
	}

	var prompt string

	if options.Style == "bullet_points" {
		prompt = fmt.Sprintf(`Summarize the following document as bullet points. Length: %s

Document:
%s

Format: Return key points as bullet points (•).`, targetLength, text)
	} else if options.Style == "key_points" {
		prompt = fmt.Sprintf(`Summarize the following document by extracting the key points. Length: %s

Document:
%s

Format: List the main key points in a clear, organized manner.`, targetLength, text)
	} else {
		// paragraph style
		prompt = fmt.Sprintf(`Summarize the following document in a clear, concise paragraph. Length: %s

Document:
%s

Format: Write a comprehensive summary in paragraph form.`, targetLength, text)
	}

	summary := LLM(prompt)
	
	if summary == "" || summary == "LLM request failed" {
		return "", fmt.Errorf("failed to generate summary")
	}

	return summary, nil
}

