
from entity_extractor import extract_entities
from story_generator import generate_story

def process_text(text):
    """Processes the text to extract entities and generate a story."""
    entities = extract_entities(text)
    story = generate_story(entities)
    return story
