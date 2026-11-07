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
    assert normalize_language("en") == "English"
    assert normalize_language("hi") == "Hindi"
    assert normalize_language("gu") == "Gujarati"
    assert normalize_language("unknown") == "English"


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
