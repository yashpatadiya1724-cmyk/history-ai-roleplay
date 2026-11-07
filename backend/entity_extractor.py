
import spacy

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_entities(text):
    """Extracts named entities from text using spaCy."""
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_
        })
    return entities
