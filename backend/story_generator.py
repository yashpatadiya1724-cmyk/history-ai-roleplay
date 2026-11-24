
import json
import re
import os

_story_generator = None

def get_story_generator():
    global _story_generator
    # Only load heavy HF pipeline if explicitly requested via env
    if os.getenv("ENABLE_LOCAL_LLM", "0") != "1":
        return None
    if _story_generator is None:
        try:
            from transformers import pipeline
            _story_generator = pipeline("text-generation", model="gpt2")
        except Exception:
            _story_generator = None
    return _story_generator

def generate_story(entities):
    """Generates a structured story based on the extracted entities."""
    person_entities = [entity["text"] for entity in entities if entity.get("label") in ["PERSON", "ENTITY"]]
    location_entities = [entity["text"] for entity in entities if entity.get("label") in ["GPE", "LOC"]]
    
    if not person_entities:
        main_character = "A curious student of history"
    else:
        main_character = person_entities[0]

    location = location_entities[0] if location_entities else "a significant historical site"
    
    prompt = f"Historical Setting: {location}. Character: {main_character}. Scene 1: The beginning of a major conflict. Describe the scene and give two choices for {main_character}."
    
    gen = get_story_generator()
    if gen:
        try:
            generated = gen(prompt, max_length=300, num_return_sequences=1, truncation=True)
            text = generated[0]["generated_text"]
            clean_text = text.replace(prompt, "").strip()
        except Exception:
            clean_text = f"In the historic halls of {location}, {main_character} faces a defining crossroads."
    else:
        clean_text = f"In the historic grounds of {location}, {main_character} steps forward as tensions escalate."

    module = {
        "title": f"The Chronicles of {main_character}",
        "scenes": [
            {
                "id": 1,
                "description": clean_text,
                "choices": [
                    {"text": "Confront the authorities", "next_scene": 2},
                    {"text": "Gather more information", "next_scene": 3}
                ]
            },
            {
                "id": 2,
                "description": f"You decided to confront the authorities. The tension in {location} rises as {main_character} stands their ground. History is watching.",
                "choices": [
                    {"text": "Negotiate peace", "next_scene": 4},
                    {"text": "Stand firm", "next_scene": 5}
                ]
            }
        ]
    }
    return module
    
    # Simple logic to structure the text into a "Module" format
    # In a real app with a better LLM, we would ask for JSON directly.
    
    # Cleaning up the generated text to avoid repetition of the prompt
    clean_text = text.replace(prompt, "").strip()
    
    module = {
        "title": f"The Chronicles of {main_character}",
        "scenes": [
            {
                "id": 1,
                "description": clean_text if clean_text else text,
                "choices": [
                    {"text": "Confront the authorities", "next_scene": 2},
                    {"text": "Gather more information", "next_scene": 3}
                ]
            },
            {
                "id": 2,
                "description": f"You decided to confront the authorities. The tension in {location} rises as {main_character} stands their ground. History is watching.",
                "choices": [
                    {"text": "Negotiate peace", "next_scene": 4},
                    {"text": "Lead a protest", "next_scene": 5}
                ]
            },
            {
                "id": 3,
                "description": f"You chose to gather information. You find secret documents that reveal the truth about the events in {location}. Knowledge is power.",
                "choices": [
                    {"text": "Leak the documents", "next_scene": 6},
                    {"text": "Use them for blackmail", "next_scene": 7}
                ]
            }
        ]
    }
    
    return json.dumps(module)
