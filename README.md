
# 📚 LitEra — Literature Time Capsule

> **Chat live with classical literary characters. Upload any book. Ask in any language.**

LitEra is an AI-powered web application that transforms classical literature into real-time, persona-grounded conversations. Instead of passively reading a 300-page text, students open a chat window and talk directly to characters like Hamlet, Devdas, Charandas Chor, Shakuntala, and more.

## ✨ Features

- **9 Pre-Built Characters**: Hamlet, Devdas, Charandas Chor, Shakuntala, Hori (Godan), Jogidas Khuman (Meghani's Saurashtrani Rasdhar), Desdemona, Sita, Meghnad
- **RAG-Powered Responses**: Upload PDFs, paste text, or share URLs — the character draws from your content
- **Streaming Chat**: Real-time SSE streaming with Ollama (100% local, no API key required)
- **Multilingual**: Ask in English, हिंदी, or ગુજરાતી — auto-detected, character responds in kind
- **What If? Mode**: Explore alternate ethical scenarios and counterfactual story paths
- **Literary Context Panel**: Character conflicts, themes, and key quotes always available
- **Dashboard**: System status, Ollama health, knowledge base metrics

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TailwindCSS, TypeScript |
| Backend | FastAPI, Python 3.10+ |
| LLM | Ollama (Llama 3, Mistral, etc.) — local, no API key |
| Vector DB | ChromaDB (persistent) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| PDF Parser | PyMuPDF (fitz) |
| Web Scraper | BeautifulSoup4 + requests |

## 📦 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **[Ollama](https://ollama.ai)** installed and running

### 1. Install Ollama & a Model

```bash
# Install Ollama from https://ollama.ai (auto-installs on Windows/Mac)
ollama pull llama3        # or: mistral, phi3, gemma2
ollama serve              # starts on http://localhost:11434
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API runs on http://localhost:8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

## 🎮 How to Use

1. **Open** `http://localhost:3000`
2. **Browse** the Character Library → click a character
3. **Upload** a PDF, paste text, or add a URL (optional but recommended)
4. **Chat** freely in English, Hindi, or Gujarati
5. **Toggle "What If?"** to explore alternate scenarios

## 📁 Project Structure

```
history-ai-roleplay/
├── backend/
│   ├── main.py               # FastAPI — all endpoints
│   ├── character_engine.py   # Persona prompts + Ollama streaming
│   ├── rag_engine.py         # ChromaDB ingestion & retrieval
│   ├── language_utils.py     # Language detection
│   ├── database.py           # SQLite — conversations & uploads
│   ├── characters/           # Character JSON profiles
│   │   ├── hamlet.json
│   │   ├── devdas.json
│   │   └── ...
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx          # Landing page
│   │   ├── characters/       # Character library
│   │   ├── chat/[id]/        # Chat room per character
│   │   └── dashboard/        # System status
│   └── src/components/
│       └── Navbar.tsx
└── README.md
```

## 🔧 Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3` | Model to use |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL for frontend |

Set `OLLAMA_MODEL` in your shell before starting backend:
```bash
set OLLAMA_MODEL=mistral   # Windows
export OLLAMA_MODEL=mistral # Unix
```

## ➕ Adding Custom Characters

Drop a `.json` file in `backend/characters/` following this schema:

```json
{
  "id": "my_character",
  "name": "Character Name",
  "work": "Book Title",
  "author": "Author Name",
  "era": "Year or Period",
  "language": "Primary Language",
  "emoji": "🎭",
  "description": "Short description",
  "tags": ["Tag1", "Tag2"],
  "personality": "Personality traits",
  "speech_style": "How they speak",
  "core_conflict": "Central dramatic tension",
  "motivations": "What drives them",
  "themes": ["Theme 1", "Theme 2"],
  "key_quotes": ["Quote 1"],
  "background_summary": "Full plot summary"
}
```

---

Created with ❤️ for literature education. Built on Ollama + ChromaDB + FastAPI + Next.js.
