"""
language_utils.py — Language detection & normalization for LitEra
Detects and normalizes Hindi, Gujarati, and English from user messages.
"""

import re

def detect_language(text: str) -> str:
    """
    Detect language from text. Returns 'hi', 'gu', or 'en'.
    Uses Unicode ranges for script detection (more reliable than langdetect for
    Devanagari/Gujarati which can be confused by short text).
    """
    if not text or not text.strip():
        return "en"

    # Count characters in each script
    devanagari = len(re.findall(r"[\u0900-\u097F]", text))
    gujarati_script = len(re.findall(r"[\u0A80-\u0AFF]", text))
    latin = len(re.findall(r"[a-zA-Z]", text))
    total = devanagari + gujarati_script + latin

    if total == 0:
        return "en"

    if gujarati_script / total > 0.2:
        return "gu"
    if devanagari / total > 0.2:
        return "hi"

    # Fallback: try langdetect for mixed/romanized text
    try:
        from langdetect import detect, LangDetectException
        detected = detect(text)
        if detected in ("hi", "gu"):
            return detected
    except Exception:
        pass

    return "en"


def normalize_language(lang_input: str, text: str = "") -> str:
    """Normalize language inputs like 'gujarati', 'Gujarati', 'gu-IN' to 'gu' / 'hi' / 'en'."""
    if not lang_input or lang_input.strip().lower() in ("auto", "auto-detect", "none"):
        return detect_language(text)
    
    clean = lang_input.strip().lower()
    if clean.startswith("gu") or "gujarat" in clean:
        return "gu"
    if clean.startswith("hi") or "hind" in clean:
        return "hi"
    if clean.startswith("en") or "engl" in clean:
        return "en"
    
    return detect_language(text)


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "हिंदी",
    "gu": "ગુજરાતી",
}


def get_language_name(code: str) -> str:
    return LANGUAGE_NAMES.get(code, "English")
