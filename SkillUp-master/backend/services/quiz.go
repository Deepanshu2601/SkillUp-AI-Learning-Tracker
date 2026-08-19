package services

import (
	"encoding/json"
	"fmt"
	"strings"
)

// Question represents a quiz question
type Question struct {
	ID            string   `json:"id"`
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectAnswer int      `json:"correct_answer"`
	Explanation   string   `json:"explanation"`
}

// UserAnswer represents a user's answer to a question
type UserAnswer struct {
	QuestionID string `json:"question_id"`
	Answer     int    `json:"answer"`
}

// QuizConfig represents configuration for quiz generation
type QuizConfig struct {
	NumQuestions int    `json:"num_questions"`
	Difficulty   string `json:"difficulty"`
}

// QuizFeedback represents feedback for a quiz question
type QuizFeedback struct {
	QuestionID    string `json:"question_id"`
	Correct       bool   `json:"correct"`
	CorrectAnswer int    `json:"correct_answer,omitempty"`
	Explanation   string `json:"explanation,omitempty"`
}

// GenerateQuizFromDocument generates quiz questions from document text using LLM
func GenerateQuizFromDocument(text string, config QuizConfig) ([]Question, error) {
	if text == "" {
		return nil, fmt.Errorf("document text is empty")
	}

	// Default configuration
	if config.NumQuestions <= 0 {
		config.NumQuestions = 10
	}
	if config.Difficulty == "" {
		config.Difficulty = "medium"
	}

	// Truncate text if too long (to fit in LLM context)
	maxChars := 8000
	if len(text) > maxChars {
		text = text[:maxChars] + "..."
	}

	prompt := fmt.Sprintf(`You are a quiz generator. Generate %d multiple-choice questions from the following text.

Difficulty: %s

Text:
%s

Return ONLY a valid JSON array of questions with this exact structure:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Requirements:
- Each question must have exactly 4 options
- correct_answer is the index (0-3) of the correct option
- Questions should test understanding, not just memorization
- Return ONLY the JSON array, no other text`, config.NumQuestions, config.Difficulty, text)

	response := LLM(prompt)

	// Try to extract JSON from response
	response = strings.TrimSpace(response)
	
	// Find JSON array in response
	startIdx := strings.Index(response, "[")
	endIdx := strings.LastIndex(response, "]")
	
	if startIdx == -1 || endIdx == -1 {
		return nil, fmt.Errorf("failed to parse quiz questions from LLM response")
	}
	
	jsonStr := response[startIdx : endIdx+1]

	var questions []Question
	if err := json.Unmarshal([]byte(jsonStr), &questions); err != nil {
		return nil, fmt.Errorf("failed to parse quiz questions: %v", err)
	}

	if len(questions) == 0 {
		return nil, fmt.Errorf("no questions generated")
	}

	return questions, nil
}

// CalculateQuizScore calculates the score based on user answers
func CalculateQuizScore(questions []Question, userAnswers []UserAnswer) (float64, []QuizFeedback) {
	if len(questions) == 0 {
		return 0, nil
	}

	// Create map for quick lookup
	answerMap := make(map[string]int)
	for _, ua := range userAnswers {
		answerMap[ua.QuestionID] = ua.Answer
	}

	correct := 0
	feedback := make([]QuizFeedback, 0, len(questions))

	for _, q := range questions {
		userAns, answered := answerMap[q.ID]
		
		fb := QuizFeedback{
			QuestionID: q.ID,
		}

		if answered && userAns == q.CorrectAnswer {
			fb.Correct = true
			correct++
		} else {
			fb.Correct = false
			fb.CorrectAnswer = q.CorrectAnswer
			fb.Explanation = q.Explanation
		}

		feedback = append(feedback, fb)
	}

	score := (float64(correct) / float64(len(questions))) * 100.0
	return score, feedback
}

