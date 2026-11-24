"""
test_api.py - Automated test suite for LitEra Backend API
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from character_engine import list_characters, load_character, _generate_fallback_response
from language_utils import detect_language, normalize_language


@pytest.fixture
def client():
    return TestClient(app)


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "LitEra"
    assert data["status"] == "running"


def test_characters_listing():
    chars = list_characters()
    assert isinstance(chars, list)
    assert len(chars) > 0
    # Verify expected characters are present
    char_ids = [c["id"] for c in chars]
    assert "hamlet" in char_ids or "devdas" in char_ids or "sita" in char_ids


def test_load_character():
    char = load_character("hamlet")
    if char:
        assert char["name"] == "Hamlet"
        assert "personality" in char
        assert "speech_style" in char


def test_language_normalization():
    assert normalize_language("en") == "en"
    assert normalize_language("hi") == "hi"
    assert normalize_language("gu") == "gu"
    assert normalize_language("unknown") == "en"
    assert normalize_language("Gujarati") == "gu"
    assert normalize_language("HINDI") == "hi"
    assert normalize_language("English") == "en"


def test_multilingual_unicode_script_detection():
    # Hindi Devanagari detection
    hindi_text = "नमस्ते, आप कैसे हैं? मुझे भारतीय इतिहास के बारे में बताइए।"
    assert detect_language(hindi_text) == "hi"

    # Gujarati script detection
    gujarati_text = "નમસ્તે, તમે કેમ છો? મને ઇતિહાસ વિશે જણાવો."
    assert detect_language(gujarati_text) == "gu"

    # English Latin detection
    english_text = "Greetings noble traveler, what brings you to our kingdom?"
    assert detect_language(english_text) == "en"

    # Auto-detect normalization fallback
    assert normalize_language("auto", text=hindi_text) == "hi"
    assert normalize_language("auto", text=gujarati_text) == "gu"


def test_character_profiles_schema_integrity():
    chars = list_characters()
    assert len(chars) > 0
    for entry in chars:
        char_id = entry["id"]
        profile = load_character(char_id)
        assert profile is not None, f"Character {char_id} must load successfully"
        assert "name" in profile and profile["name"]
        assert "work" in profile
        assert "author" in profile
        assert "personality" in profile
        assert "speech_style" in profile


def test_nonexistent_character_returns_none():
    assert load_character("non_existent_hero_404") is None


def test_fallback_response_generation():
    char = {
        "name": "Hamlet",
        "work": "Hamlet",
        "author": "William Shakespeare",
        "personality": "Melancholic, philosophical",
        "speech_style": "Poetic and brooding",
        "core_conflict": "Indecision",
        "themes": ["Mortality", "Doubt"],
        "quotes": ["To be, or not to be, that is the question."]
    }
    response = _generate_fallback_response(char, "What troubles you so deeply?", "English", False, [])
    assert isinstance(response, str)
    assert len(response) > 20
    assert "Hamlet" in response or "question" in response or "soul" in response or "thought" in response


def test_entity_extractor():
    from entity_extractor import extract_entities
    ents = extract_entities("William Shakespeare lived in Stratford-upon-Avon.")
    assert isinstance(ents, list)


def test_story_generator_structure():
    from story_generator import generate_story
    sample_entities = [
        {"text": "Julius Caesar", "label": "PERSON"},
        {"text": "Rome", "label": "GPE"}
    ]
    story = generate_story(sample_entities)
    assert "title" in story
    assert "scenes" in story
    assert len(story["scenes"]) >= 2
    assert "choices" in story["scenes"][0]


def test_api_character_routes(client):
    # Test GET /characters/
    res = client.get("/characters/")
    assert res.status_code == 200
    chars = res.json()
    assert isinstance(chars, list)
    assert len(chars) > 0

    first_id = chars[0]["id"]

    # Test GET /characters/{id}
    char_res = client.get(f"/characters/{first_id}")
    assert char_res.status_code == 200
    char_data = char_res.json()
    assert char_data["id"] == first_id
    assert "name" in char_data
    assert "knowledge_base" in char_data

    # Test GET /characters/non_existent_404
    missing_res = client.get("/characters/non_existent_unknown_99")
    assert missing_res.status_code == 404


def test_database_persistence_and_retrieval():
    import uuid
    from database import create_tables, save_message, get_conversation_history, log_upload, get_uploads_for_character
    create_tables()

    test_session = f"sess_ci_test_{uuid.uuid4().hex[:8]}"
    test_char = f"hamlet_{uuid.uuid4().hex[:6]}"

    # Save user message
    save_message(test_session, test_char, "user", "What is nobility?", "en", False)
    # Save character response with What-If mode
    save_message(test_session, test_char, "assistant", "Nobility is but a fragile crown.", "en", True)

    history = get_conversation_history(test_session, limit=10)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "What is nobility?"
    assert history[1]["role"] == "assistant"
    assert history[1]["what_if_mode"] == 1

    # Log upload and retrieve
    log_upload(test_char, "text", "The Tragedy of Hamlet", 15)
    uploads = get_uploads_for_character(test_char)
    assert len(uploads) == 1
    assert uploads[0]["source_label"] == "The Tragedy of Hamlet"
    assert uploads[0]["chunk_count"] == 15


def test_rag_chunking_and_deduplication():
    from rag_engine import chunk_text

    # Empty text returns empty chunks
    assert chunk_text("") == []
    assert chunk_text("   \n\t  ") == []

    # Short text within single chunk
    short_text = "Alexander the Great invaded the Persian Empire in 334 BC."
    single_chunks = chunk_text(short_text, chunk_size=200, overlap=50)
    assert len(single_chunks) == 1
    assert single_chunks[0] == short_text

    # Multi-chunk text with overlap
    long_text = "Word " * 150
    chunks = chunk_text(long_text, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    for c in chunks:
        assert len(c) <= 100
        assert c.strip() != ""


def test_rag_knowledge_base_info_and_lifecycle():
    from rag_engine import get_knowledge_base_info, clear_knowledge_base

    info = get_knowledge_base_info("non_existent_hero_123")
    assert info["character_id"] == "non_existent_hero_123"
    assert info["has_knowledge"] is False
    assert info["chunk_count"] == 0

    cleared = clear_knowledge_base("non_existent_hero_123")
    assert isinstance(cleared, bool)

