"""
main.py — LitEra Backend API
FastAPI server providing character chat, RAG ingestion, and the existing story roleplay endpoints.
"""

import uuid
import json
import asyncio
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from database import (
    get_db_connection, create_tables, save_message,
    get_conversation_history, log_upload, get_uploads_for_character
)
from character_engine import (
    load_character, list_characters, stream_chat, check_ollama_available,
    extract_and_create_characters_from_text, save_character
)
from rag_engine import (
    retrieve_context, ingest_text, ingest_pdf, ingest_url,
    get_knowledge_base_info, clear_knowledge_base
)
from language_utils import detect_language, normalize_language

# Legacy imports (kept for backward compatibility)
try:
    from ai_pipeline import process_text
    from role_playing_engine import RolePlayingEngine
    LEGACY_AVAILABLE = True
except Exception:
    LEGACY_AVAILABLE = False

app = FastAPI(title="LitEra API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory game sessions (legacy)
game_sessions = {}


@app.on_event("startup")
def on_startup():
    create_tables()


# ============================================================
# HEALTH & STATUS
# ============================================================

@app.get("/")
def read_root():
    return {"app": "LitEra", "version": "2.0.0", "status": "running"}


@app.get("/health/ollama")
async def check_ollama():
    available = await check_ollama_available()
    return {"ollama_available": available}


# ============================================================
# CHARACTERS
# ============================================================

@app.get("/characters/")
def get_characters():
    """List all available literary characters."""
    return list_characters()


@app.get("/characters/{character_id}")
def get_character(character_id: str):
    """Get full character profile."""
    character = load_character(character_id)
    if not character:
        raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found")
    
    kb_info = get_knowledge_base_info(character_id)
    uploads = get_uploads_for_character(character_id)
    
    return {
        **character,
        "knowledge_base": kb_info,
        "uploads": uploads
    }


class ExtractTextRequest(BaseModel):
    text: str
    book_title: Optional[str] = "Uploaded Book"
    author_name: Optional[str] = "Classical Author"
    auto_rag: Optional[bool] = True


@app.post("/characters/extract-from-text/")
async def extract_characters_text_endpoint(request: ExtractTextRequest):
    """Analyze text/book, create new character profile(s), and optionally auto-index into RAG."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty")

    try:
        characters = await extract_and_create_characters_from_text(
            text=request.text,
            book_title=request.book_title,
            author_name=request.author_name
        )

        total_chunks = 0
        if request.auto_rag and characters:
            for char in characters:
                char_id = char["id"]
                try:
                    chunks = ingest_text(char_id, request.text, f"{request.book_title or 'Book'} Source")
                    log_upload(char_id, "text", request.book_title or "Book Manuscript", chunks)
                    total_chunks += chunks
                except Exception as rag_err:
                    print(f"RAG ingestion warning for {char_id}: {rag_err}")

        return {
            "success": True,
            "characters": characters,
            "chunks_indexed": total_chunks,
            "message": f"Successfully forged {len(characters)} character persona(s) from '{request.book_title}'!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/characters/extract-from-pdf/")
async def extract_characters_pdf_endpoint(
    file: UploadFile = File(...),
    book_title: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    auto_rag: Optional[bool] = Form(True)
):
    """Upload a PDF book, extract full text, forge characters, and auto-ingest into RAG."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        file_bytes = await file.read()
        extracted_text = ""

        # Extract text using PyMuPDF / fitz
        try:
            import pymupdf as fitz
        except ImportError:
            try:
                import fitz
            except ImportError:
                fitz = None

        if fitz:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text() + "\n"
        else:
            # Fallback with pypdf
            try:
                import pypdf
                import io
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    extracted_text += (page.extract_text() or "") + "\n"
            except Exception:
                extracted_text = f"Manuscript from {file.filename}"

        resolved_title = book_title or file.filename.rsplit(".", 1)[0].replace("_", " ").title()
        resolved_author = author_name or "Classical Author"

        characters = await extract_and_create_characters_from_text(
            text=extracted_text,
            book_title=resolved_title,
            author_name=resolved_author
        )

        total_chunks = 0
        if auto_rag and characters:
            for char in characters:
                char_id = char["id"]
                try:
                    chunks = ingest_pdf(char_id, file_bytes, file.filename)
                    log_upload(char_id, "pdf", file.filename, chunks)
                    total_chunks += chunks
                except Exception as rag_err:
                    print(f"RAG ingestion warning for {char_id}: {rag_err}")

        return {
            "success": True,
            "characters": characters,
            "chunks_indexed": total_chunks,
            "filename": file.filename,
            "message": f"Successfully parsed '{file.filename}' and created {len(characters)} character(s)!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ============================================================
# KNOWLEDGE BASE (RAG Ingestion)
# ============================================================

class IngestTextRequest(BaseModel):
    character_id: str
    text: str
    source_label: Optional[str] = "manual-text"


class IngestUrlRequest(BaseModel):
    character_id: str
    url: str


@app.post("/knowledge/ingest-text/")
async def ingest_text_endpoint(request: IngestTextRequest):
    """Ingest plain text into a character's knowledge base."""
    character = load_character(request.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    try:
        chunk_count = ingest_text(request.character_id, request.text, request.source_label)
        log_upload(request.character_id, "text", request.source_label, chunk_count)
        return {"success": True, "chunks_indexed": chunk_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/knowledge/ingest-pdf/")
async def ingest_pdf_endpoint(
    character_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Ingest a PDF file into a character's knowledge base."""
    character = load_character(character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        file_bytes = await file.read()
        chunk_count = ingest_pdf(character_id, file_bytes, file.filename)
        log_upload(character_id, "pdf", file.filename, chunk_count)
        return {"success": True, "filename": file.filename, "chunks_indexed": chunk_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/knowledge/ingest-url/")
async def ingest_url_endpoint(request: IngestUrlRequest):
    """Ingest a web page URL into a character's knowledge base."""
    character = load_character(request.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    try:
        chunk_count = ingest_url(request.character_id, request.url)
        log_upload(request.character_id, "url", request.url[:100], chunk_count)
        return {"success": True, "url": request.url, "chunks_indexed": chunk_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/knowledge/{character_id}")
def get_knowledge_info(character_id: str):
    """Get knowledge base info for a character."""
    return {
        **get_knowledge_base_info(character_id),
        "uploads": get_uploads_for_character(character_id)
    }


@app.delete("/knowledge/{character_id}")
def delete_knowledge(character_id: str):
    """Clear the knowledge base for a character."""
    success = clear_knowledge_base(character_id)
    return {"success": success}


# ============================================================
# CHAT (LitEra Core Feature)
# ============================================================

class ChatRequest(BaseModel):
    character_id: str
    session_id: Optional[str] = None
    message: str
    what_if_mode: bool = False
    language: Optional[str] = "auto"


@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    """
    Send a message to a literary character and get a streaming response.
    Returns SSE (Server-Sent Events) stream.
    """
    character = load_character(request.character_id)
    if not character:
        raise HTTPException(status_code=404, detail=f"Character '{request.character_id}' not found")

    session_id = request.session_id or str(uuid.uuid4())

    # Detect and normalize language (e.g. 'gu', 'hi', 'en')
    lang = normalize_language(request.language, request.message)

    # Retrieve conversation history
    history_rows = get_conversation_history(session_id, limit=12)
    history = [{"role": r["role"], "content": r["content"]} for r in history_rows]

    # Retrieve relevant context from RAG
    context_chunks = retrieve_context(request.character_id, request.message, top_k=5)

    async def generate():
        full_response = ""
        
        # Send session_id first as SSE metadata
        yield f"data: {json.dumps({'type': 'meta', 'session_id': session_id, 'language': lang})}\n\n"

        try:
            async for token in stream_chat(
                character=character,
                context_chunks=context_chunks,
                message=request.message,
                history=history,
                language=lang,
                what_if_mode=request.what_if_mode,
            ):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            return

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

        # Save to DB (non-blocking)
        try:
            save_message(session_id, request.character_id, "user", request.message, lang, request.what_if_mode)
            save_message(session_id, request.character_id, "assistant", full_response, lang, request.what_if_mode)
        except Exception as e:
            print(f"DB save error: {e}")

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/conversations/{session_id}")
def get_conversation(session_id: str):
    """Get conversation history for a session."""
    history = get_conversation_history(session_id, limit=100)
    return {"session_id": session_id, "messages": history}


@app.delete("/conversations/{session_id}")
def clear_conversation(session_id: str):
    """Clear conversation history for a session."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM conversations WHERE session_id = ?", (session_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"success": True, "session_id": session_id}


# ============================================================
# LEGACY ENDPOINTS (Existing story roleplay — kept intact)
# ============================================================

class TextRequest(BaseModel):
    title: str
    content: str


class StartGameRequest(BaseModel):
    story_module_id: int
    player_role: str


class MakeDecisionRequest(BaseModel):
    session_id: int
    choice: str
    story_module_id: Optional[int] = None
    player_role: Optional[str] = None


@app.post("/analyze-text/")
def analyze_text(request: TextRequest):
    if not LEGACY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Legacy NLP pipeline not available")
    try:
        story = process_text(request.content)
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO historical_texts (title, content) VALUES (?, ?)", (request.title, request.content))
        text_id = cur.lastrowid
        cur.execute("INSERT INTO story_modules (historical_text_id, title, module_data) VALUES (?, ?, ?)",
                    (text_id, f"Story from {request.title}", story))
        module_id = cur.lastrowid
        conn.commit()
        cur.close()
        conn.close()
        return {"story": story, "module_id": module_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/start-game/")
def start_game(request: StartGameRequest):
    if not LEGACY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Legacy roleplay engine not available")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT module_data FROM story_modules WHERE id = ?", (request.story_module_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"Story module {request.story_module_id} not found")
    module_data = row["module_data"]
    session_id = len(game_sessions) + 1
    engine = RolePlayingEngine(module_data)
    game_sessions[session_id] = engine
    scene = engine.start_game(request.player_role)
    return {"session_id": session_id, "scene": scene}


@app.post("/make-decision/")
def make_decision(request: MakeDecisionRequest):
    if not LEGACY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Legacy roleplay engine not available")
    if request.session_id not in game_sessions:
        if request.story_module_id and request.player_role:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT module_data FROM story_modules WHERE id = ?", (request.story_module_id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                engine = RolePlayingEngine(row["module_data"])
                engine.start_game(request.player_role)
                game_sessions[request.session_id] = engine
            else:
                raise HTTPException(status_code=404, detail="Game session expired and module not found.")
        else:
            raise HTTPException(status_code=404, detail="Game session expired. Please refresh the page.")
    try:
        engine = game_sessions[request.session_id]
        scene = engine.make_decision(request.choice)
        return {"scene": scene}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/historical-texts/")
def get_historical_texts():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, uploaded_at FROM historical_texts ORDER BY uploaded_at DESC")
        texts = cur.fetchall()
        cur.close()
        conn.close()
        return [{"id": t[0], "title": t[1], "uploaded_at": t[2]} for t in texts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/story-modules/")
def get_story_modules():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, created_at FROM story_modules ORDER BY created_at DESC")
        modules = cur.fetchall()
        cur.close()
        conn.close()
        return [{"id": m[0], "title": m[1], "created_at": m[2]} for m in modules]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
