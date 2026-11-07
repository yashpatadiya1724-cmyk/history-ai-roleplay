# 📚 History AI Roleplay — LitEra Classical Literature Time Capsule

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker%20Compose-Ready-2496ED?logo=docker)](https://docker.com)

> **History AI Roleplay (LitEra)** is a full-stack, persona-grounded AI companion engine that transforms classical world and Indian literature into real-time, interactive conversations. Talk directly to historical and literary figures like **Hamlet, Devdas, Shakuntala, Sita, Hori, Meghnad, Charandas Chor, and Jogidas Khuman**.

---

## ✨ Key Features

- **🎭 Persona-Grounded Characters:**
  - *Western Classics:* Hamlet (Shakespeare), Desdemona (Othello).
  - *Indian Epics & Literature:* Devdas (Sarat Chandra), Shakuntala (Kalidasa), Sita (Ramayana), Meghnad (Meghnad Badh Kavya), Hori (Munshi Premchand's *Godan*), Charandas Chor (Habib Tanvir), Jogidas Khuman (Zaverchand Meghani's *Saurashtrani Rasdhar*).
- **🤖 Multi-Provider LLM Streaming:**
  - **Google Gemini 1.5 Flash:** Native SSE streaming using `GEMINI_API_KEY`.
  - **OpenAI GPT-4o-mini:** Streaming via `OPENAI_API_KEY`.
  - **Local Ollama:** 100% offline private inference (`llama3`, `mistral`, `phi3`).
  - **Literary Fallback Simulation:** Built-in algorithmic fallback when no LLM key or Ollama is online.
- **📚 Retrieval-Augmented Generation (RAG):**
  - Ingest PDFs, text passages, and research URLs into persistent **ChromaDB** vector storage using `sentence-transformers`.
- **🌐 Multilingual Intelligence:**
  - Real-time language detection across **English, Hindi (हिंदी), and Gujarati (ગુજરાતી)**.
- **🔮 "What If?" Scenario Explorer:**
  - Counterfactual story engine testing ethical dilemmas and alternate story endings.
- **🐳 1-Click Docker Compose Deployment:**
  - Pre-configured multi-container stack for Backend, Nginx-proxied Frontend, and Ollama service.

---

## 🛠️ Tech Stack Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, TailwindCSS 4, Lucide Icons, Canvas Confetti |
| **Backend** | Python 3.11, FastAPI (Lifespan Context), Pydantic, HTTPX, SQLite |
| **Vector DB / RAG** | ChromaDB, Sentence-Transformers (`all-MiniLM-L6-v2`), PyMuPDF, BeautifulSoup4 |
| **LLM Support** | Google Gemini API, OpenAI API, Ollama (Llama 3 / Mistral) |
| **DevOps** | Docker, Docker Compose, Multi-stage Nginx builds |

---

## 🚀 Quick Start (Docker)

Run the complete frontend, backend, and vector database with one command:

```bash
docker compose up --build
```
- **Web App:** `http://localhost:3000`
- **Backend API & Swagger Docs:** `http://localhost:8000/docs`

---

## 💻 Manual Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # On Windows (or source venv/bin/activate on Linux/Mac)

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest test_api.py

# Launch FastAPI server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install Node packages
npm install

# Start Vite development server
npm run dev
# Running on http://localhost:5173 (or http://localhost:3000)
```

---

## 🔑 Environment Variables (Optional)

Create `.env` in `backend/`:
```env
# Optional: Use Google Gemini 1.5 Flash
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Use OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Local Ollama (default if keys are not set)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## 📄 License

Licensed under the MIT License.
