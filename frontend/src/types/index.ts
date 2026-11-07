export interface Character {
  id: string;
  name: string;
  work: string;
  author: string;
  era: string;
  language: string;
  emoji: string;
  description: string;
  tags: string[];
  personality: string;
  speech_style: string;
  core_conflict: string;
  motivations: string;
  themes: string[];
  key_quotes: string[];
  background_summary: string;
  knowledge_base?: {
    character_id: string;
    total_chunks: number;
  };
  uploads?: UploadRecord[];
}

export interface UploadRecord {
  id: number;
  character_id: string;
  source_type: 'text' | 'pdf' | 'url';
  source_name: string;
  chunk_count: number;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
  what_if?: boolean;
  isStreaming?: boolean;
}

export interface KnowledgeBaseInfo {
  character_id: string;
  total_chunks: number;
  uploads?: UploadRecord[];
}

export interface StoryModule {
  id: number;
  title: string;
  created_at: string;
  historical_text_id?: number;
  module_data?: any;
}

export interface StoryScene {
  narrative?: string;
  current_scene?: string;
  choices?: string[];
  options?: string[];
  status?: string;
  outcome?: string;
  [key: string]: any;
}
