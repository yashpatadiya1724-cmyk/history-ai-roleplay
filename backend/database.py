"""
database.py — LitEra Database Layer
Extended schema to support characters, conversations, and knowledge base tracking.
"""

import sqlite3
from pathlib import Path

DB_NAME = str(Path(__file__).parent / "litera.db")


def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()

    # Legacy tables (kept for backward compatibility)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS historical_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS story_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historical_text_id INTEGER REFERENCES historical_texts(id),
        title TEXT NOT NULL,
        module_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # New LitEra tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        what_if_mode INTEGER DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_base_uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_label TEXT NOT NULL,
        chunk_count INTEGER DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    cur.close()
    conn.close()


def save_message(session_id: str, character_id: str, role: str, content: str,
                 language: str = "en", what_if_mode: bool = False):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO conversations 
           (session_id, character_id, role, content, language, what_if_mode)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (session_id, character_id, role, content, language, int(what_if_mode))
    )
    conn.commit()
    cur.close()
    conn.close()


def get_conversation_history(session_id: str, limit: int = 20) -> list[dict]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT role, content, language, what_if_mode, timestamp
           FROM conversations
           WHERE session_id = ?
           ORDER BY timestamp ASC
           LIMIT ?""",
        (session_id, limit)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def log_upload(character_id: str, source_type: str, source_label: str, chunk_count: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO knowledge_base_uploads 
           (character_id, source_type, source_label, chunk_count)
           VALUES (?, ?, ?, ?)""",
        (character_id, source_type, source_label, chunk_count)
    )
    conn.commit()
    cur.close()
    conn.close()


def get_uploads_for_character(character_id: str) -> list[dict]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT source_type, source_label, chunk_count, uploaded_at
           FROM knowledge_base_uploads
           WHERE character_id = ?
           ORDER BY uploaded_at DESC""",
        (character_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


if __name__ == "__main__":
    create_tables()
    print("Database tables created.")
