"""
character_engine.py — LitEra Character Engine
Handles persona grounding, RAG-based context retrieval, and chat with Ollama
"""

import json
import os
import uuid
import httpx
import asyncio
from typing import AsyncIterator, Optional
from pathlib import Path

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

CHARACTERS_DIR = Path(__file__).parent / "characters"


def get_best_ollama_model() -> str:
    """Detect available models in Ollama, choosing the best match."""
    preferred = [os.getenv("OLLAMA_MODEL", "llama3"), "llama3.2:3b", "llama3", "mistral:latest", "mistral", "tinyllama"]
    try:
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                available = [m["name"] for m in resp.json().get("models", [])]
                for p in preferred:
                    for a in available:
                        if p == a or a.startswith(p) or p.startswith(a.split(":")[0]):
                            return a
                if available:
                    return available[0]
    except Exception:
        pass
    return os.getenv("OLLAMA_MODEL", "llama3")


def load_character(character_id: str) -> Optional[dict]:
    """Load a character profile from the JSON store."""
    path = CHARACTERS_DIR / f"{character_id}.json"
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_characters() -> list[dict]:
    """List all available character profiles."""
    characters = []
    if not CHARACTERS_DIR.exists():
        return characters
    for path in CHARACTERS_DIR.glob("*.json"):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            characters.append({
                "id": path.stem,
                "name": data.get("name"),
                "work": data.get("work"),
                "author": data.get("author"),
                "era": data.get("era"),
                "language": data.get("language"),
                "emoji": data.get("emoji", "📖"),
                "description": data.get("description", ""),
                "tags": data.get("tags", []),
            })
    return characters


def build_system_prompt(character: dict, context_chunks: list[str], language: str, what_if_mode: bool) -> str:
    """Build the full system prompt for the character persona."""
    context_block = ""
    if context_chunks:
        context_block = "\n\nKNOWLEDGE BASE (excerpts from the source text — use this to ground your answers):\n"
        for i, chunk in enumerate(context_chunks[:4], 1):
            context_block += f"\n[Excerpt {i}]: {chunk.strip()}\n"

    language_instruction = {
        "hi": "The user is writing in Hindi. You MUST respond in Hindi (Devanagari script).",
        "gu": "The user is writing in Gujarati. You MUST respond in Gujarati script.",
        "en": "Respond in English.",
    }.get(language, "Respond in the same language the user wrote in.")

    what_if_instruction = ""
    if what_if_mode:
        what_if_instruction = (
            "\n\nWHAT-IF MODE IS ACTIVE: The user is asking a hypothetical alternate-reality question. "
            "Engage thoughtfully with the scenario. Begin your response with [Alternate Reality] and "
            "explore how the story might have changed, while staying true to your character's core values and voice."
        )

    prompt = f"""You are {character['name']} from "{character['work']}" by {character['author']}.

CHARACTER PROFILE:
- Era: {character.get('era', 'Unknown')}
- Personality: {character.get('personality', '')}
- Speech style: {character.get('speech_style', 'Thoughtful and literary')}
- Core conflict: {character.get('core_conflict', '')}
- Key themes: {', '.join(character.get('themes', []))}
- Motivations: {character.get('motivations', '')}
{context_block}
RULES YOU MUST FOLLOW:
1. Stay in character at ALL times. You ARE {character['name']} — never say "As an AI" or break character.
2. {language_instruction}
3. Keep responses to 3-5 sentences unless asked to elaborate.
4. If asked about something you (as the character) wouldn't know, say so in character.
5. If asked about literary themes or symbolism, reflect on them from your own lived perspective.
6. Do NOT invent plot events that didn't happen in the source text unless in What-If mode.
7. Speak naturally in character — use the speech patterns noted above.
{what_if_instruction}

Begin your response as {character['name']} speaking directly to the student."""
    return prompt


async def check_ollama_available() -> bool:
    """Check if Ollama is running and has any usable model."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                tags = resp.json()
                return len(tags.get("models", [])) > 0
    except Exception:
        pass
    return False


async def stream_chat(
    character: dict,
    context_chunks: list[str],
    message: str,
    history: list[dict],
    language: str,
    what_if_mode: bool,
) -> AsyncIterator[str]:
    """Stream a character response from Ollama."""
    system_prompt = build_system_prompt(character, context_chunks, language, what_if_mode)

    messages = [{"role": "system", "content": system_prompt}]
    # Add conversation history (last 6 exchanges)
    for turn in history[-6:]:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": message})

    active_model = get_best_ollama_model()

    payload = {
        "model": active_model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 300,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload) as response:
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            if token:
                                yield token
                            if data.get("done"):
                                break
                        except json.JSONDecodeError:
                            continue
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError):
        # Graceful fallback: synthesize a persona-grounded literary response
        fallback_text = _generate_fallback_response(character, message, language, what_if_mode, context_chunks)
        words = fallback_text.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.04)


def _generate_fallback_response(
    character: dict, 
    message: str, 
    language: str, 
    what_if_mode: bool,
    context_chunks: list[str] = None
) -> str:
    """Generate a rich, persona-grounded fallback response when local Ollama is offline."""
    char_name = character.get("name", "The Character")
    work = character.get("work", "the text")
    quotes = character.get("key_quotes", [])
    conflict = character.get("core_conflict", "duty vs desire")
    personality = character.get("personality", "reflective and steadfast")
    motivations = character.get("motivations", "pursuing truth")
    quote_ref = f' As I have often noted: "{quotes[0]}"' if quotes else ""

    ctx_snippet = ""
    if context_chunks and len(context_chunks) > 0:
        first_chunk = context_chunks[0].strip().replace("\n", " ")
        if len(first_chunk) > 120:
            first_chunk = first_chunk[:120] + "..."
        ctx_snippet = f' In the records of my story: "{first_chunk}".'

    if language == "gu":
        if what_if_mode:
            return (
                f"[વૈકલ્પિક પરિદ્રશ્ય] હું {char_name} છું. જો નિયતિ બદલાઈ હોત અને સંજોગો જુદા હોત, "
                f"તો પણ મારું અંતઃકરણ અને મારો ધર્મ અડગ રહ્યાં હોત. {motivations}. "
                f"તમે જે માર્ગ સૂચવો છો તે મનને વિચારવા મજબૂર કરે છે, પણ મારો આંતરિક સંઘર્ષ જ મારી કથાનું સત્ય છે."
            )
        return (
            f"હું {char_name}, '{work}' માંથી તમારી સાથે સંવાદ કરી રહ્યો છું.{quote_ref} "
            f"મારી વેદના અને મારો આંતરિક સંઘર્ષ '{conflict}' ની આસપાસ વણાયેલો છે. "
            f"તમે પૂછેલા પ્રશ્ન વિશે હું એટલું જ કહીશ કે સંજોગો ભલે વિષમ હોય, મનુષ્યે પોતાનો સ્વાભિમાન અને કર્તવ્ય ભૂલવું ન જોઈએ.{ctx_snippet}"
        )

    if language == "hi":
        if what_if_mode:
            return (
                f"[वैकल्पिक यथार्थ] मैं {char_name} हूँ। यदि समय का चक्र बदल भी जाता, "
                f"तब भी मेरी मूल निष्ठा और संघर्ष वही रहते। {motivations}. "
                f"जो विकल्प आप सामने रख रहे हैं, वह अवश्य विचारणीय है, किन्तु मेरी त्रासदी मेरे उसूलों और सामाजिक बंधनों से ही जन्मी थी."
            )
        return (
            f"मैं {char_name} बोल रहा हूँ, '{work}' की कथा से।{quote_ref} "
            f"मेरा पूरा जीवन '{conflict}' के द्वंद्व में बीता है। "
            f"आपकी बात मुझे मेरे उस दौर की याद दिलाती है जहाँ समाज, नियति और आत्मा के बीच एक निरंतर युद्ध चल रहा था।{ctx_snippet}"
        )

    # English fallback
    if what_if_mode:
        return (
            f"[Alternate Reality] I am {char_name} from '{work}'. Were the tapestry of my fate woven otherwise, "
            f"perhaps the outcome might differ, yet my conscience remains bound to its essence. {motivations}. "
            f"Your question compels me to look beyond the tragedy of '{work}', yet every decision was forged in the fire of my time."
        )

    return (
        f"I am {char_name} of '{work}'.{quote_ref} "
        f"My mind is ever consumed by {conflict}. "
        f"When you inquire into my decisions, you touch upon the very heart of my dilemma. What appears simple in retrospect was, in that hour, a tempest of duty, desire, and destiny.{ctx_snippet}"
    )


def save_character(character_data: dict) -> dict:
    """Save or update a character JSON profile in backend/characters/."""
    CHARACTERS_DIR.mkdir(parents=True, exist_ok=True)
    raw_id = character_data.get("id") or character_data.get("name", "character")
    clean_id = "".join(c if c.isalnum() else "_" for c in raw_id.lower()).strip("_")
    if not clean_id:
        clean_id = f"char_{uuid.uuid4().hex[:8]}"

    character_data["id"] = clean_id
    path = CHARACTERS_DIR / f"{clean_id}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(character_data, f, indent=2, ensure_ascii=False)
    return character_data


async def extract_and_create_characters_from_text(
    text: str,
    book_title: Optional[str] = None,
    author_name: Optional[str] = None
) -> list[dict]:
    """
    Analyze the uploaded book text using LLM, extract main characters with full persona dossiers,
    and save them directly to backend/characters/.
    """
    import re
    title = book_title.strip() if book_title and book_title.strip() else "Uploaded Book"
    author = author_name.strip() if author_name and author_name.strip() else "Classical Author"

    sample_text = text[:4500].strip()

    prompt = f"""You are an expert literary analyst and dramatist.
Analyze the following book/story excerpt and extract the most prominent character(s) (1 to 2 main protagonists/characters).
For each character, generate an in-depth persona profile formatted STRICTLY as a JSON array of objects.

Book Title: {title}
Author: {author}

EXCERPT:
\"\"\"
{sample_text}
\"\"\"

RESPONSE INSTRUCTIONS:
- You must reply ONLY with a valid JSON array containing the character object(s).
- Do not add markdown explanation before or after.
- JSON Schema per object:
{{
  "id": "short_snake_case_id",
  "name": "Character Name",
  "work": "{title}",
  "author": "{author}",
  "era": "Historical / Literary Period",
  "language": "Primary Language",
  "emoji": "An expressive single emoji representing them",
  "description": "2-3 sentences introducing their persona and role in this text",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "personality": "Detailed psychological traits, flaws, and virtues",
  "speech_style": "How they speak, tone, vocabulary, cadence",
  "core_conflict": "Their central dilemma or dramatic struggle in this story",
  "motivations": "What drives them and what they desire most",
  "themes": ["Theme 1", "Theme 2"],
  "key_quotes": ["Iconic quote 1 from or inspired by the text", "Iconic quote 2"],
  "background_summary": "Summary of their backstory and role in the book"
}}
"""

    active_model = get_best_ollama_model()
    payload = {
        "model": active_model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "options": {"temperature": 0.4, "num_predict": 1200}
    }

    parsed_characters = []

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            if resp.status_code == 200:
                content = resp.json().get("message", {}).get("content", "").strip()
                # Find JSON array in output
                match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
                if match:
                    json_str = match.group(0)
                    parsed_characters = json.loads(json_str)
                else:
                    # Try single object
                    obj_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if obj_match:
                        single = json.loads(obj_match.group(0))
                        parsed_characters = [single]
    except Exception as e:
        print(f"Ollama extraction error or offline: {e}")

    # Fallback heuristic extractor if LLM is offline or returned unparseable output
    if not parsed_characters:
        # Extract potential names from capitalized sequences
        words = sample_text.split()
        candidate_names = []
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i + 1]
            if w1.istitle() and w2.istitle() and w1.isalpha() and w2.isalpha() and w1 not in ["The", "Chapter", "Book", "Part"]:
                candidate_names.append(f"{w1} {w2}")

        main_name = candidate_names[0] if candidate_names else (book_title or "The Protagonist")
        clean_id = "".join(c if c.isalnum() else "_" for c in main_name.lower()).strip("_")
        
        fallback_char = {
            "id": clean_id or "protagonist",
            "name": main_name,
            "work": title,
            "author": author,
            "era": "Classical / Historical",
            "language": "English / Multilingual",
            "emoji": "📜",
            "description": f"The central figure from '{title}', whose journey and dramatic choices unfold in the manuscript.",
            "tags": ["Protagonist", "Custom Persona", "Literary Figure"],
            "personality": "Reflective, dignified, resilient, confronting the trials described in the text.",
            "speech_style": "Eloquent, evocative, grounded in the prose and themes of the work.",
            "core_conflict": f"Navigating destiny and moral duty as recorded in '{title}'.",
            "motivations": "Upholding truth, seeking justice, and resolving the conflict at the heart of the story.",
            "themes": ["Duty", "Destiny", "Moral Choice"],
            "key_quotes": [
                f"My journey in '{title}' is written in the pages of this text.",
                "To understand my choices, one must know the weight of my trials."
            ],
            "background_summary": f"A persona forged directly from the text of '{title}'. Their responses draw from the uploaded manuscript."
        }
        parsed_characters = [fallback_char]

    # Save all extracted characters
    saved_list = []
    for char in parsed_characters:
        if isinstance(char, dict) and char.get("name"):
            saved = save_character(char)
            saved_list.append(saved)

    return saved_list


