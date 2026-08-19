package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"skillup-backend/config"
)

// Gemini chat request structure
type geminiChatReq struct {
	Contents []geminiContent `json:"contents"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

// Gemini chat response structure
type geminiChatResp struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

// LLM generates text response using Gemini API
func LLM(prompt string) string {
	if prompt == "" {
		return ""
	}

	// Build Gemini API request
	reqBody := geminiChatReq{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
	}

	b, err := json.Marshal(reqBody)
	if err != nil {
		return "LLM request failed"
	}

	// Call Gemini generateContent API
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
		config.AppConfig.GEMINI_MODEL, config.AppConfig.GEMINI_API_KEY)
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(b))
	if err != nil {
		return "LLM request failed"
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "LLM request failed"
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "LLM request failed"
	}

	var out geminiChatResp
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return "LLM request failed"
	}

	if len(out.Candidates) == 0 || len(out.Candidates[0].Content.Parts) == 0 {
		return ""
	}

	return out.Candidates[0].Content.Parts[0].Text
}

