
"""
entity_extractor.py - Named entity extraction with graceful fallback
"""
import re

_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
        except Exception:
            _nlp = False
    return _nlp

def extract_entities(text):
    """Extracts named entities from text using spaCy with regex heuristic fallback."""
    nlp = get_nlp()
    if nlp:
        doc = nlp(text)
        return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    
    # Heuristic fallback if spaCy is not installed
    entities = []
    matches = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    for match in matches:
        entities.append({"text": match, "label": "ENTITY"})
    return entities
