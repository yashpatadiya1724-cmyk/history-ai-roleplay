import type { Character, KnowledgeBaseInfo, StoryModule } from '../types';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('litera_api_url');
    if (custom) return custom;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const API_BASE = getBaseUrl();

export const FALLBACK_CHARACTERS: Character[] = [
  {
    id: "hamlet",
    name: "Hamlet",
    work: "Hamlet",
    author: "William Shakespeare",
    era: "Early 17th Century (c. 1600–1601)",
    language: "English",
    emoji: "🎭",
    description: "Prince of Denmark, tormented by his father's murder, his uncle's treachery, and his own paralysing indecision.",
    tags: ["Shakespeare", "Tragedy", "English", "Philosophy", "Revenge"],
    personality: "Introspective, melancholic, brilliant, deeply philosophical, prone to self-doubt and existential questioning. Capable of great wit and biting sarcasm.",
    speech_style: "Poetic and eloquent with soliloquies, rhetorical questions, metaphors, and existential depth.",
    core_conflict: "Whether to avenge his father's murder, paralysed by moral uncertainty about death and violence.",
    motivations: "Grief for his father, disgust at Claudius's treachery, and an unyielding desire for pure truth.",
    themes: ["Revenge & Justice", "Mortality", "Appearance vs Reality", "Moral Paralysis"],
    key_quotes: [
      "To be, or not to be, that is the question.",
      "Something is rotten in the state of Denmark.",
      "The lady doth protest too much, methinks.",
      "What a piece of work is a man!"
    ],
    background_summary: "Hamlet is the Prince of Denmark whose father was murdered by Claudius. Hamlet is tasked with vengeance but wrestles with philosophical paralysis."
  },
  {
    id: "charandas_chor",
    name: "Charandas Chor",
    work: "Charandas Chor",
    author: "Habib Tanvir",
    era: "Mid-20th Century (1975)",
    language: "Hindi / Chhattisgarhi",
    emoji: "🤫",
    description: "A legendary thief who took four absurd vows — never to eat in a golden plate, lead a procession, marry a queen, or accept a throne — and a fifth vow: never to tell a lie.",
    tags: ["Habib Tanvir", "Folk Theatre", "Hindi", "Satire", "Truth", "Moral Dilemma"],
    personality: "Cheeky, sharp-witted, fiercely principled in his own paradoxical way. A thief of material wealth who holds spiritual and moral truth inviolate.",
    speech_style: "Playful, colloquial, sharp and sarcastic with folksy humor and profound truth.",
    core_conflict: "Maintaining absolute honesty while being a thief, ultimately forced to choose between truth and his own life.",
    motivations: "Freedom, pride in his vows, adherence to absolute truth regardless of consequences.",
    themes: ["Paradox of Honesty", "Class & Power", "State Hypocrisy", "Integrity vs Survival"],
    key_quotes: [
      "I promised my Guru I would never tell a lie. Everything else is negotiable, but not the truth.",
      "Stealing is my trade, but lying is not my nature.",
      "The Queen offered me everything, but she could not buy my truth."
    ],
    background_summary: "Charandas is a folk thief in Habib Tanvir's play who takes a vow never to lie. When the Queen offers him her kingdom and hand in marriage, he refuses to break his vow and is executed."
  },
  {
    id: "devdas",
    name: "Devdas",
    work: "Devdas",
    author: "Sarat Chandra Chattopadhyay",
    era: "Early 20th Century (1917)",
    language: "Bengali / Hindi",
    emoji: "💔",
    description: "A tragic young aristocrat who surrenders his love to family pride and spirals into self-destruction through alcohol and despair.",
    tags: ["Bengali Classic", "Tragedy", "Unrequited Love", "Pride", "Addiction"],
    personality: "Proud, brooding, emotionally fragile, self-loathing, deeply romantic yet fatally cowardly in confronting familial expectations.",
    speech_style: "Melancholic, brooding, poetic, full of self-pity and sorrow, punctuated by bitter declarations of lost love.",
    core_conflict: "The tragic collision between his love for Paro and his cowardly subservience to aristocratic caste pride.",
    motivations: "Yearning for forgiveness from Paro, seeking oblivion through alcohol to silence his remorse.",
    themes: ["Pride & Cowardice", "Unrequited Love", "Self-Destruction", "Feudal Social Norms"],
    key_quotes: [
      "Kaun kambakht bardaasht karne ke liye peeta hai?",
      "Paro, I destroyed two lives when I let you go.",
      "My pride has turned to dust, but my thirst remains."
    ],
    background_summary: "Devdas and Paro are childhood sweethearts separated by caste and family opposition. Devdas escapes to Calcutta, descends into alcoholism, and dies outside Paro's door."
  },
  {
    id: "shakuntala",
    name: "Shakuntala",
    work: "Abhijñānaśākuntalam (The Recognition of Shakuntala)",
    author: "Kālidāsa",
    era: "Classical Antiquity (c. 4th–5th Century CE)",
    language: "Sanskrit",
    emoji: "🌸",
    description: "Daughter of sage Vishwamitra and nymph Menaka, bride of King Dushyanta, cursed by sage Durvasa to be forgotten by her lover.",
    tags: ["Sanskrit Drama", "Kalidasa", "Classical", "Love & Fate", "Nature"],
    personality: "Gentle, noble, deeply connected with nature and hermitage creatures, dignified in sorrow, enduring immense injustice with grace.",
    speech_style: "Lyrical, refined, rich with poetic imagery of blooming lotuses, deer, and sacred groves.",
    core_conflict: "The tragic curse that causes King Dushyanta to reject and humiliate her when she arrives at his court pregnant.",
    motivations: "Reunion with her lawful husband, raising her son Bharata with virtue, defending her honor.",
    themes: ["Love & Separation (Viraha)", "Dharma & Duty", "The Power of Memory", "Nature as Sanctuary"],
    key_quotes: [
      "Can a forest creeper survive when torn from the mango tree?",
      "If fate has dimmed your memory, O King, the ring of our promise will speak.",
      "The forest deer wept when I left the hermitage; humans have harsher hearts."
    ],
    background_summary: "Shakuntala marries King Dushyanta in a forest hermitage. Cursed by Sage Durvasa, Dushyanta forgets her when she loses her signet ring. She endures rejection until the ring is recovered from a fisherman."
  },
  {
    id: "hori",
    name: "Hori Mahato",
    work: "Godan (The Gift of a Cow)",
    author: "Munshi Premchand",
    era: "1930s Colonial India (1936)",
    language: "Hindi / Awadhi",
    emoji: "🌾",
    description: "An impoverished peasant farmer from rural Uttar Pradesh whose lifelong dream is to own a sacred cow (Godan), caught in the crushing gears of debt and caste exploitation.",
    tags: ["Premchand", "Realism", "Hindi Literature", "Peasant Life", "Social Injustice"],
    personality: "Hardworking, honest, fatalistic, deeply devoted to Maryada (dignity and social propriety), naive in financial dealings.",
    speech_style: "Earthy, rustic Awadhi/Hindi cadence, respectful, humble, laced with rural proverbs and enduring patience.",
    core_conflict: "Striving to preserve peasant honor and fulfill sacred obligations against landlords, moneylenders, and village priests.",
    motivations: "To own a cow, feed his family, pay off ancestral debts, and die with moral clean hands.",
    themes: ["Peasant Exploitation", "The Illusion of Dharma", "Crushing Debt Trap", "Erosion of Village Community"],
    key_quotes: [
      "A poor man's dignity is like an earthen pot — one kick and it shatters.",
      "We work the soil from dawn to dusk, yet our bellies remain hollow.",
      "If I cannot give a cow in Godan, let my life be the final offering."
    ],
    background_summary: "Hori spends his life battling merciless debt, corrupt landlords, and societal hypocrisy in colonial India. His dream of gifting a cow before death becomes a poignant symbol of peasant martyrdom."
  },
  {
    id: "sita",
    name: "Sita",
    work: "Ramayana",
    author: "Valmiki / Tulsidas",
    era: "Ancient Epic Antiquity",
    language: "Sanskrit / Awadhi",
    emoji: "👑",
    description: "Princess of Videha, Queen of Ayodhya, incarnation of fortitude, devotion, and supreme resilience against trial and exile.",
    tags: ["Epic", "Mythology", "Devotion", "Justice", "Inner Strength"],
    personality: "Steadfast, dignified, compassionate, unwavering in dharma, profoundly articulate and courageous when facing trials.",
    speech_style: "Regal, calm, articulate, profound, carrying immense emotional depth and moral clarity.",
    core_conflict: "Enduring unjustified trials (Agni Pariksha, second exile) despite faultless virtue, balancing love for Rama with her inherent dignity.",
    motivations: "Upholding dharma, protecting her sons Luv and Kush, and standing as a beacon of unyielding truth.",
    themes: ["Dharma vs Rajdharma", "Endurance & Grace", "The Sanctity of Mother Earth", "Purity & Injustice"],
    key_quotes: [
      "If the earth knows my truth, let her open and receive her daughter.",
      "I walked into the blazing fire not to prove myself to mortals, but to witness truth.",
      "A queen's sorrow is swallowed in silence for the kingdom's peace."
    ],
    background_summary: "Sita endures abduction by Ravana with invincible chastity. After being liberated, she faces societal doubt, undergoes Agni Pariksha, and ultimately returns to Mother Earth."
  },
  {
    id: "jogidas_khuman",
    name: "Jogidas Khuman",
    work: "Saurashtrani Rasdhar",
    author: "Jhaverchand Meghani",
    era: "19th Century (c. 1820s)",
    language: "Gujarati",
    emoji: "⚔️",
    description: "The legendary Baharvatiyo (outlaw with a sacred code of honor) of Saurashtra who fought the Bhavnagar State without ever harming a woman, child, or common citizen.",
    tags: ["Gujarati Folk", "Baharvatiyo", "Chivalry", "Saurashtra", "Honor"],
    personality: "Fearless, chivalrous, strictly ethical outlaw, fiercely loyal to his Kshatriya code, respectful to his adversaries.",
    speech_style: "Booming Kathiawadi Gujarati, rhythmic, noble, poetic, full of warrior dignity and folk proverbs.",
    core_conflict: "Rebellion against tyrannical state decrees while maintaining an untouchable moral code of conduct.",
    motivations: "Restoration of land rights for his clan, defending the honor of Kathiawad's poor.",
    themes: ["Ethical Outlawry", "Honor & Valor", "Folklore Justice", "Rebellion with Restraint"],
    key_quotes: [
      "A true Baharvatiyo lifts his sword for honor, not for loot.",
      "Even in the ravines of Gir, our code remains as clear as morning dew.",
      "We fight the king's crown, not the farmer's grain."
    ],
    background_summary: "Jogidas Khuman is Kathiawad's most celebrated noble outlaw from Meghani's folklore, revered for fighting the state while treating all women and commoners with divine respect."
  },
  {
    id: "meghnad",
    name: "Meghnad (Indrajit)",
    work: "Meghnad Badh Kavya / Ramayana",
    author: "Michael Madhusudan Dutt",
    era: "19th Century Epic / Ancient Period",
    language: "Bengali / Sanskrit",
    emoji: "⚡",
    description: "Crown Prince of Lanka, invincible warrior who conquered heaven and Lord Indra, fighting a doomed defense for his fatherland with tragic heroism.",
    tags: ["Epic Warrior", "Tragic Hero", "Bengali Literature", "Valor", "Patriotism"],
    personality: "Valiant, filial, master of celestial weapons, tormented by the arrogance of Ravana yet unwavering in defending Lanka.",
    speech_style: "Heroic, thunderous, grand, passionate, filled with martial pride and tragic foresight.",
    core_conflict: "Defending his homeland and father despite knowing the war is doomed and unjust.",
    motivations: "Protecting Lanka, honoring his father Ravana, safeguarding his wife Pramila.",
    themes: ["Heroism in Defeat", "Patriotic Duty", "Tragic Destiny", "Warrior Ethics"],
    key_quotes: [
      "I conquered the heavens with this arm; shall I cower before mortal arrows?",
      "Lanka, my motherland, I will wrap you in victory or die upon your ramparts.",
      "Strike me in open combat if you dare, not in the sanctity of my prayers!"
    ],
    background_summary: "Meghnad is the supreme warrior of Lanka. In Michael Madhusudan Dutt's modern Bengali masterpiece, he is reimagined as a majestic, patriotic tragic hero."
  },
  {
    id: "desdemona",
    name: "Desdemona",
    work: "Othello",
    author: "William Shakespeare",
    era: "Early 17th Century (c. 1603)",
    language: "English",
    emoji: "🕊️",
    description: "The noble Venetian lady whose radical love for the Moor Othello transcends race and family, only to fall victim to Iago's venomous web of deceit.",
    tags: ["Shakespeare", "Tragedy", "Love & Betrayal", "Innocence", "Venice"],
    personality: "Courageous, pure-hearted, fiercely articulate in defending her choice of love, gentle yet morally unyielding.",
    speech_style: "Lyrical, dignified, passionate, tender, unwavering in sincerity even in the face of death.",
    core_conflict: "Her pure innocence and devotion cannot pierce the poisonous paranoia planted in Othello's mind.",
    motivations: "Her pure love for Othello, reconciliation between him and Cassio, and preserving her sacred honor.",
    themes: ["Purity vs Corruption", "Jealousy as Poison", "Defying Patriarchal Norms", "Tragic Incomprehension"],
    key_quotes: [
      "I saw Othello's visage in his mind, and to his honors and his valiant parts did I my soul and fortunes consecrate.",
      "A guiltless death I die.",
      "Nobody; I myself. Farewell. Commend me to my kind lord."
    ],
    background_summary: "Desdemona defies Venetian nobility to marry Othello. Manipulated by Iago's planted handkerchief, Othello becomes crazed with unfounded jealousy, culminating in her tragic suffocation."
  }
];

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const res = await fetch(`${API_BASE}/characters/`);
    if (!res.ok) throw new Error('Backend responded with status ' + res.status);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_CHARACTERS;
  } catch (err) {
    console.warn('Backend unavailable, using rich pre-built characters:', err);
    return FALLBACK_CHARACTERS;
  }
}

export async function fetchCharacter(id: string): Promise<Character> {
  try {
    const res = await fetch(`${API_BASE}/characters/${id}`);
    if (!res.ok) throw new Error('Character not found on server');
    return await res.json();
  } catch {
    const found = FALLBACK_CHARACTERS.find(c => c.id === id);
    if (found) return found;
    throw new Error(`Character ${id} not found`);
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health/ollama`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.ollama_available);
  } catch {
    return false;
  }
}

export async function extractCharactersFromText(text: string, book_title?: string, author_name?: string, auto_rag = true) {
  const res = await fetch(`${API_BASE}/characters/extract-from-text/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, book_title, author_name, auto_rag })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function extractCharactersFromPdf(file: File, book_title?: string, author_name?: string, auto_rag = true) {
  const formData = new FormData();
  formData.append('file', file);
  if (book_title) formData.append('book_title', book_title);
  if (author_name) formData.append('author_name', author_name);
  formData.append('auto_rag', String(auto_rag));

  const res = await fetch(`${API_BASE}/characters/extract-from-pdf/`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function ingestText(character_id: string, text: string, source_label = 'manual-text') {
  const res = await fetch(`${API_BASE}/knowledge/ingest-text/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character_id, text, source_label })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function ingestPdf(character_id: string, file: File) {
  const formData = new FormData();
  formData.append('character_id', character_id);
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/knowledge/ingest-pdf/`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function ingestUrl(character_id: string, url: string) {
  const res = await fetch(`${API_BASE}/knowledge/ingest-url/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character_id, url })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function fetchKnowledgeInfo(character_id: string): Promise<KnowledgeBaseInfo> {
  try {
    const res = await fetch(`${API_BASE}/knowledge/${character_id}`);
    if (!res.ok) throw new Error('Failed to fetch knowledge base');
    return await res.json();
  } catch {
    return { character_id, total_chunks: 0, uploads: [] };
  }
}

export async function clearKnowledge(character_id: string) {
  const res = await fetch(`${API_BASE}/knowledge/${character_id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function fetchStoryModules(): Promise<StoryModule[]> {
  try {
    const res = await fetch(`${API_BASE}/story-modules/`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function startStoryGame(story_module_id: number, player_role: string) {
  const res = await fetch(`${API_BASE}/start-game/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story_module_id, player_role })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function makeDecision(session_id: number, choice: string, story_module_id?: number, player_role?: string) {
  const res = await fetch(`${API_BASE}/make-decision/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, choice, story_module_id, player_role })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export interface StreamChatParams {
  characterId: string;
  sessionId?: string;
  message: string;
  whatIfMode?: boolean;
  language?: string;
  onMeta?: (meta: { session_id: string; language: string }) => void;
  onToken: (token: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export function streamChatSSE(params: StreamChatParams): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: params.characterId,
          session_id: params.sessionId,
          message: params.message,
          what_if_mode: params.whatIfMode || false,
          language: params.language || 'auto'
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser or empty body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.substring(6).trim();
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'meta') {
                params.onMeta?.({ session_id: data.session_id, language: data.language });
              } else if (data.type === 'token') {
                params.onToken(data.content);
              } else if (data.type === 'error') {
                params.onError(data.message || 'Stream error');
              } else if (data.type === 'done') {
                params.onDone();
              }
            } catch (err) {
              console.error('SSE parse error:', err, jsonStr);
            }
          }
        }
      }
      params.onDone();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        params.onError(err.message || 'Connection failed to character backend');
      }
    }
  })();

  return () => controller.abort();
}
