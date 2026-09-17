# SkillUp — AI-Powered Learning Platform

SkillUp is a full-stack AI-powered learning platform built to help students organize their learning, study from PDF documents, ask questions about their study material, generate quizzes, and track their learning activities.

The project combines a modern **Next.js + TypeScript frontend**, **Go REST API backend**, **PostgreSQL with pgvector**, and **Google Gemini AI** to provide an AI-assisted learning experience.

---

## 📌 Overview

Students often use different applications for reading notes, asking questions, creating quizzes, setting learning goals, and tracking their study progress.

SkillUp brings these capabilities together in a single platform.

### Core Workflow

```text
Create Account
      ↓
Set Learning Goals
      ↓
Upload Study Material
      ↓
Process PDF
      ↓
Generate Embeddings
      ↓
Ask Questions / Generate Quiz
      ↓
Practice & Learn
      ↓
Track Study Activity
```

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* User-specific data access

### 🎯 Learning Goals

Users can create and manage learning goals.

Each goal can contain:

* Goal title
* Target date
* Active/completed status
* User-specific ownership

---

### 📄 PDF-Based Learning

Users can upload PDF study material directly to the platform.

SkillUp:

1. Accepts the uploaded PDF
2. Extracts text from the document
3. Splits the extracted text into smaller chunks
4. Generates vector embeddings
5. Stores the chunks and embeddings in PostgreSQL
6. Makes the content searchable using vector similarity

---

### 🤖 AI Study Assistant

SkillUp includes an AI chat system that allows users to ask questions about their uploaded study material.

The system uses **Retrieval-Augmented Generation (RAG)**.

```text
User Question
      ↓
Generate Query Embedding
      ↓
Vector Similarity Search
      ↓
Retrieve Relevant Document Chunks
      ↓
Build Context
      ↓
Gemini AI
      ↓
Generate Answer
```

The retrieval system searches the user's document chunks using PostgreSQL + pgvector before sending relevant context to the AI model.

---

### 🧠 AI Quiz Generation

SkillUp can generate quizzes from uploaded documents using Gemini AI.

The quiz system supports:

* Multiple-choice questions
* Multiple answer options
* Correct answer
* Explanations
* Difficulty level
* Score calculation
* Quiz submission
* Quiz history

---

### 📊 Study Activity Tracking

The backend includes study activity tracking for activities such as:

* Reading
* Quiz
* Flashcards
* AI Chat

Activities can include:

* Activity type
* Duration
* Related topic
* Additional activity data
* Creation timestamp

---

## 🏗️ Architecture

```text
┌───────────────────────────────────────┐
│             Frontend                  │
│                                       │
│       Next.js + React + TypeScript    │
│                                       │
└──────────────────┬────────────────────┘
                   │
                   │ REST API
                   ▼
┌───────────────────────────────────────┐
│              Backend                  │
│                                       │
│          Go + Gin + GORM              │
│                                       │
└──────────────┬───────────┬────────────┘
               │           │
               │           │
               ▼           ▼
       ┌─────────────┐  ┌──────────────┐
       │ PostgreSQL  │  │ Gemini API   │
       │ + pgvector  │  │              │
       └─────────────┘  └──────────────┘
               │
               ▼
       ┌─────────────────┐
       │ Vector Search   │
       │ + RAG Pipeline  │
       └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology   | Purpose                |
| ------------ | ---------------------- |
| Next.js 16   | Frontend framework     |
| React 19     | UI development         |
| TypeScript   | Type-safe development  |
| Tailwind CSS | Styling                |
| React PDF    | PDF viewing            |
| PDF.js       | PDF processing/viewing |
| Lucide React | Icons                  |
| Motion       | UI animations          |

### Backend

| Technology | Purpose                  |
| ---------- | ------------------------ |
| Go 1.24.4  | Backend development      |
| Gin        | HTTP web framework       |
| GORM       | ORM/database interaction |
| JWT        | Authentication           |
| bcrypt     | Password hashing         |
| UUID       | Unique identifiers       |

### Database

| Technology | Purpose                                 |
| ---------- | --------------------------------------- |
| PostgreSQL | Primary database                        |
| pgvector   | Vector embeddings and similarity search |
| JSONB      | Storing structured AI/quiz data         |

### AI

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| Google Gemini     | AI text generation               |
| Gemini Embeddings | Document/query embeddings        |
| RAG               | Context-based question answering |
| Vector Search     | Relevant document retrieval      |

---

## 📂 Project Structure

```text
SkillUp/
│
├── backend/
│   │
│   ├── config/
│   │   └── config.go
│   │
│   ├── controllers/
│   │   ├── activity.go
│   │   ├── auth.go
│   │   ├── chat.go
│   │   ├── document.go
│   │   ├── goals.go
│   │   ├── quizzes.go
│   │   └── topics.go
│   │
│   ├── db/
│   │   ├── db.go
│   │   └── models.go
│   │
│   ├── middleware/
│   │   └── auth.go
│   │
│   ├── routes/
│   │   └── routes.go
│   │
│   ├── services/
│   │   ├── embeddings.go
│   │   ├── llm.go
│   │   ├── pdf.go
│   │   ├── quiz.go
│   │   ├── rag.go
│   │   └── summary.go
│   │
│   ├── utils/
│   │   └── jwt.go
│   │
│   ├── go.mod
│   ├── go.sum
│   └── main.go
│
├── frontend/
│   │
│   ├── app/
│   │   ├── about/
│   │   ├── goals/
│   │   ├── learn/
│   │   ├── login/
│   │   ├── quiz/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── pdf/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── next.config.ts
│
└── README.md
```

---

# 🔄 How SkillUp Works

## 1. User Authentication

A user creates an account or logs in.

```text
Signup/Login
     ↓
Validate Credentials
     ↓
Hash/Verify Password
     ↓
Generate JWT
     ↓
Authenticated User
```

---

## 2. Document Processing

When a user uploads a PDF:

```text
PDF Upload
    ↓
Read PDF File
    ↓
Extract Text
    ↓
Split Text into Chunks
    ↓
Generate Embeddings
    ↓
Store in PostgreSQL
```

The backend uses the PDF processing service to extract text from uploaded documents.

---

## 3. Vector Search

Document chunks are converted into embeddings and stored using PostgreSQL with pgvector.

When the user asks a question:

```text
Question
   ↓
Question Embedding
   ↓
pgvector Similarity Search
   ↓
Top Relevant Chunks
```

The retrieved chunks are then passed to the RAG system.

---

## 4. RAG-Based AI Chat

```text
Question
   +
Relevant Document Context
   ↓
RAG Prompt
   ↓
Gemini
   ↓
AI Answer
```

This allows the assistant to use relevant information from the user's uploaded documents when generating answers.

---

## 5. Quiz Generation

```text
Uploaded Document
       ↓
Document Content
       ↓
Gemini AI
       ↓
Quiz Questions
       ↓
User Attempts Quiz
       ↓
Answers Evaluated
       ↓
Score + Feedback
```

Quiz questions and user answers are stored as structured JSON data in PostgreSQL.

---

# 🔌 API Endpoints

## Authentication

### Signup

```http
POST /api/auth/signup
```

### Login

```http
POST /api/auth/login
```

---

## Goals

```http
GET /api/goals
POST /api/goals
```

---

## Documents

```http
POST /api/documents/upload
GET /api/documents
GET /api/documents/:document_id
GET /api/documents/:document_id/file
POST /api/documents/:document_id/summarize
```

---

## AI Chat

```http
POST /api/chat/query
```

---

## Quizzes

```http
POST /api/quizzes/generate/:document_id
GET /api/quizzes/:quiz_id
POST /api/quizzes/:quiz_id/submit
GET /api/quizzes/document/:document_id
GET /api/quizzes
```

---

# 🗄️ Database Models

SkillUp uses several database models.

```text
User
 │
 ├── Goals
 │
 ├── Topics
 │
 ├── Documents
 │      │
 │      ├── DocumentRaw
 │      │
 │      └── DocumentChunk
 │               │
 │               └── Embeddings
 │
 ├── Quizzes
 │
 ├── StudyActivities
 │
 └── ChatMessages
```

### Main Tables

* `users`
* `goals`
* `topics`
* `documents`
* `document_raws`
* `document_chunks`
* `quizzes`
* `study_activities`
* `chat_messages`

---

# ⚙️ Installation

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Go 1.24+
* PostgreSQL
* PostgreSQL `pgvector` extension
* Google Gemini API key

---

# 🚀 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Download Go dependencies:

```bash
go mod download
```

Create a `.env` file:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
EMBED_MODEL=your_embedding_model
```

Then run:

```bash
go run main.go
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔑 Environment Variables

The backend expects the following environment variables:

| Variable         | Description                        |
| ---------------- | ---------------------------------- |
| `DATABASE_URL`   | PostgreSQL database connection     |
| `JWT_SECRET`     | Secret used for JWT authentication |
| `GEMINI_API_KEY` | Google Gemini API key              |
| `GEMINI_MODEL`   | Gemini generation model            |
| `EMBED_MODEL`    | Gemini embedding model             |

### ⚠️ Security

Never commit your `.env` file to GitHub.

Do not expose:

```text
DATABASE_URL
JWT_SECRET
GEMINI_API_KEY
```

Use environment variables for sensitive configuration.

---

# 🧪 Development Commands

### Frontend

Start development server:

```bash
npm run dev
```

Build production application:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

### Backend

Download dependencies:

```bash
go mod download
```

Run backend:

```bash
go run main.go
```

---

# 📈 Future Improvements

Potential improvements for future versions include:

* Personalized AI study plans
* AI-generated flashcards
* Learning progress dashboard
* Advanced analytics
* Spaced repetition
* Course and resource recommendations
* Voice-based AI assistant
* Improved document retrieval
* Cloud file storage
* Production deployment
* Mobile application

---

# 🎓 Learning Outcomes

This project demonstrates practical implementation of:

* Full-Stack Web Development
* REST API Development
* Authentication & Authorization
* Database Design
* PostgreSQL
* Vector Databases
* AI API Integration
* Generative AI
* RAG Architecture
* Embeddings
* Semantic Search
* PDF Processing
* AI Quiz Generation
* TypeScript
* React
* Next.js
* Go

---

# 👨‍💻 Project

**SkillUp — AI-Powered Learning Platform**

Built as a full-stack AI learning project combining modern web technologies with Generative AI and vector search.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
