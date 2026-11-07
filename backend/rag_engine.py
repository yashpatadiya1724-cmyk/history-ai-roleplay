"""
rag_engine.py — LitEra RAG (Retrieval-Augmented Generation) Engine
Handles document ingestion (PDF, text, URL), chunking, embedding,
and similarity search using ChromaDB + sentence-transformers.
"""

import os
import re
import uuid
import hashlib
import json
import asyncio
from pathlib import Path
from typing import Optional

try:
    import chromadb
    from chromadb.config import Settings
    HAS_CHROMA = True
except ImportError:
    HAS_CHROMA = False
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    SentenceTransformer = None

# Try to import optional parsers
try:
    import fitz  # PyMuPDF
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_WEB = True
except ImportError:
    HAS_WEB = False

# ---------- Config ----------
CHROMA_PATH = Path(__file__).parent / "chroma_db"
EMBED_MODEL = "all-MiniLM-L6-v2"  # fast, small, good multilingual
CHUNK_SIZE = 400    # characters
CHUNK_OVERLAP = 80

# ---------- Globals ----------
_embed_model = None
_chroma_client = None


def get_embed_model():
    global _embed_model
    if not HAS_TRANSFORMERS:
        return None
    if _embed_model is None:
        _embed_model = SentenceTransformer(EMBED_MODEL)
    return _embed_model


def get_chroma_client():
    global _chroma_client
    if not HAS_CHROMA:
        return None
    if _chroma_client is None:
        CHROMA_PATH.mkdir(parents=True, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return _chroma_client


def get_collection(character_id: str):
    """Get or create a ChromaDB collection for a character."""
    client = get_chroma_client()
    if client is None:
        return None
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "_", character_id)
    # ChromaDB collection names must be 3-63 chars
    safe_id = safe_id[:63] if len(safe_id) >= 3 else f"col_{safe_id}"
    return client.get_or_create_collection(
        name=safe_id,
        metadata={"hnsw:space": "cosine"}
    )


# ---------- Text extraction ----------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not HAS_PDF:
        raise RuntimeError("PyMuPDF not installed. Run: pip install PyMuPDF")
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def extract_text_from_url(url: str) -> str:
    if not HAS_WEB:
        raise RuntimeError("requests/beautifulsoup4 not installed.")
    resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    # Remove scripts/styles
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


# ---------- Chunking ----------

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping character chunks."""
    text = re.sub(r"\s+", " ", text).strip()
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap
        if start >= len(text):
            break
    return chunks


# ---------- Ingestion ----------

def ingest_text(character_id: str, text: str, source_label: str = "uploaded") -> int:
    """Chunk and embed text into ChromaDB for a character. Returns number of chunks stored."""
    chunks = chunk_text(text)
    if not chunks:
        return 0

    model = get_embed_model()
    embeddings = model.encode(chunks, show_progress_bar=False).tolist()

    collection = get_collection(character_id)

    ids = []
    docs = []
    embeds = []
    metas = []

    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        # Deduplicate by hash
        chunk_hash = hashlib.md5(chunk.encode()).hexdigest()
        doc_id = f"{source_label}_{chunk_hash}"
        ids.append(doc_id)
        docs.append(chunk)
        embeds.append(emb)
        metas.append({"source": source_label, "index": i})

    # Upsert (safe if duplicates exist)
    collection.upsert(ids=ids, documents=docs, embeddings=embeds, metadatas=metas)
    return len(chunks)


def ingest_pdf(character_id: str, file_bytes: bytes, filename: str = "document.pdf") -> int:
    text = extract_text_from_pdf(file_bytes)
    return ingest_text(character_id, text, source_label=filename)


def ingest_url(character_id: str, url: str) -> int:
    text = extract_text_from_url(url)
    return ingest_text(character_id, text, source_label=url[:60])


# ---------- Retrieval ----------

def retrieve_context(character_id: str, query: str, top_k: int = 5) -> list[str]:
    """Retrieve the most relevant text chunks for a query."""
    try:
        collection = get_collection(character_id)
        if collection is None:
            return []
        count = collection.count()
        if count == 0:
            return []

        model = get_embed_model()
        if model is None:
            return []
        query_embedding = model.encode([query]).tolist()[0]

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, count),
            include=["documents"]
        )
        return results["documents"][0] if results["documents"] else []
    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return []


def get_knowledge_base_info(character_id: str) -> dict:
    """Get info about the knowledge base for a character."""
    try:
        collection = get_collection(character_id)
        if collection is None:
            return {"character_id": character_id, "chunk_count": 0, "has_knowledge": False}
        count = collection.count()
        return {"character_id": character_id, "chunk_count": count, "has_knowledge": count > 0}
    except Exception:
        return {"character_id": character_id, "chunk_count": 0, "has_knowledge": False}


def clear_knowledge_base(character_id: str) -> bool:
    """Clear all knowledge for a character."""
    try:
        client = get_chroma_client()
        safe_id = re.sub(r"[^a-zA-Z0-9_-]", "_", character_id)[:63]
        client.delete_collection(safe_id)
        return True
    except Exception:
        return False
