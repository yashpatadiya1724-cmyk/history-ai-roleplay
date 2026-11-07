import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Character, ChatMessage } from '../types';
import { 
  fetchCharacter, 
  fetchCharacters, 
  streamChatSSE, 
  ingestText, 
  ingestPdf, 
  ingestUrl, 
  fetchKnowledgeInfo,
  clearKnowledge
} from '../services/api';
import { speakText, stopSpeech, isSpeaking } from '../components/SpeechSynthesizer';
import { 
  Send, 
  Sparkles, 
  Flame, 
  Globe, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  BookOpen, 
  Database, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  ChevronRight, 
  Quote, 
  Info,
  AlertCircle
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const characterId = id || 'hamlet';

  // Characters list & Active character
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => `litera_${Date.now()}`);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');

  // UI Panels
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dossier' | 'rag'>('dossier');

  // In-Chat RAG Ingestion State
  const [ragText, setRagText] = useState('');
  const [ragUrl, setRagUrl] = useState('');
  const [ragFile, setRagFile] = useState<File | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragFeedback, setRagFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [ragChunks, setRagChunks] = useState(0);

  // Audio Speech state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const userIsNearBottomRef = useRef<boolean>(true);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // Track if user scrolled up manually
  const handleContainerScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    userIsNearBottomRef.current = distanceToBottom < 100;
  };

  // What-If Presets by Character
  const whatIfPresets: Record<string, string[]> = {
    hamlet: [
      "What if you drew your sword and killed King Claudius while he was kneeling in prayer?",
      "What if you confided fully in Ophelia instead of feigning madness?",
      "What if you chose to escape Denmark with Horatio rather than seek vengeance?"
    ],
    charandas_chor: [
      "What if you accepted the Queen's marriage proposal and broke your vow of truth?",
      "What if you stole from the temple but confessed to the priests beforehand?",
      "What if you used your wit to become the Prime Minister of the kingdom?"
    ],
    devdas: [
      "What if you defied your father's pride and eloped with Paro on her wedding night?",
      "What if you accepted Chandramukhi's devotion and built a life with her in Calcutta?",
      "What if you returned to Paro sober and begged for forgiveness?"
    ],
    shakuntala: [
      "What if you never lost the signet ring in the sacred river?",
      "What if you stayed in the court of Dushyanta and demanded justice from the elders?",
      "What if you raised Bharata in the forest without ever looking back at Hastinapura?"
    ],
    hori: [
      "What if you joined the peasant revolt against the Zamindar and Thakur?",
      "What if you refused to pay the priest's fines and renounced your village caste duties?",
      "What if your son Gobar brought you to the city to start anew?"
    ],
    sita: [
      "What if you refused to undergo the Agni Pariksha and established your own hermitage?",
      "What if you demanded Rama step down from the throne rather than exile you?",
      "What if you returned with Luv and Kush to challenge Ayodhya's courtiers?"
    ],
    jogidas_khuman: [
      "What if you burned the royal treasury of Bhavnagar rather than honoring the code?",
      "What if you allied with the British officers against the royal court?",
      "What if the ruler offered you full pardons and governorship over Saurashtra?"
    ],
    meghnad: [
      "What if you imprisoned Ravana to end the war and save the people of Lanka?",
      "What if you challenged Lord Rama to single combat on the plains of Lanka?",
      "What if you survived Lakshmana's ambush at the Nikumbhila grove?"
    ],
    desdemona: [
      "What if you caught Iago in his lies before Othello saw the handkerchief?",
      "What if you fled to Venice and appealed to your father and the Doge?",
      "What if you challenged Othello's accusations before the Venetian Senate?"
    ]
  };

  // Load character data
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([fetchCharacters(), fetchCharacter(characterId)])
      .then(([, current]) => {
        if (!mounted) return;
        setCharacter(current);
        setLoading(false);

        // Load RAG chunk stats
        fetchKnowledgeInfo(characterId).then((kb) => {
          if (mounted) setRagChunks(kb.total_chunks || 0);
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Reset messages for new character
    setMessages([]);
    setSessionId(`session_${characterId}_${Date.now()}`);

    return () => {
      mounted = false;
      stopSpeech();
      if (cancelStreamRef.current) cancelStreamRef.current();
    };
  }, [characterId]);

  // Auto-scroll on new messages only if user is near bottom
  useEffect(() => {
    if (userIsNearBottomRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Send message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isStreaming || !character) return;

    // Reset user scroll state to bottom when sending new message
    userIsNearBottomRef.current = true;
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      what_if: whatIfMode,
      language: selectedLanguage
    };

    const assistantPlaceholder: ChatMessage = {
      id: `ast_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      what_if: whatIfMode,
      isStreaming: true
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInputMessage('');
    setIsStreaming(true);

    // Cancel any previous active stream
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
    }

    cancelStreamRef.current = streamChatSSE({
      characterId: character.id,
      sessionId: sessionId,
      message: text,
      whatIfMode: whatIfMode,
      language: selectedLanguage,
      onMeta: (meta) => {
        if (meta.session_id) setSessionId(meta.session_id);
      },
      onToken: (token) => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];
          if (!last || last.role !== 'assistant') return prev;

          const updated = [...prev];
          updated[lastIndex] = {
            ...last,
            content: last.content + token
          };
          return updated;
        });
      },
      onError: (err) => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];
          if (!last || last.role !== 'assistant') return prev;

          const updated = [...prev];
          updated[lastIndex] = {
            ...last,
            content: last.content + `\n\n*(Error: ${err}. If running locally, make sure Ollama and FastAPI are running on port 8000)*`,
            isStreaming: false
          };
          return updated;
        });
        setIsStreaming(false);
      },
      onDone: () => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];
          if (!last || last.role !== 'assistant') return prev;

          const updated = [...prev];
          updated[lastIndex] = {
            ...last,
            isStreaming: false
          };
          return updated;
        });
        setIsStreaming(false);
      }
    });
  };

  const handleClearChat = () => {
    stopSpeech();
    setMessages([]);
    setSessionId(`session_${characterId}_${Date.now()}`);
  };

  const handleToggleSpeech = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id && isSpeaking()) {
      stopSpeech();
      setSpeakingMessageId(null);
    } else {
      stopSpeech();
      setSpeakingMessageId(msg.id);
      speakText(
        msg.content,
        msg.language || character?.language,
        () => setSpeakingMessageId(msg.id),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // In-Chat RAG Ingestion Submissions
  const handleIngestText = async () => {
    if (!ragText.trim() || !character) return;
    setRagLoading(true);
    setRagFeedback(null);
    try {
      const res = await ingestText(character.id, ragText, 'in-chat-notes');
      setRagFeedback({ type: 'success', message: `Indexed ${res.chunks_indexed} new knowledge chunks!` });
      setRagText('');
      setRagChunks((prev) => prev + (res.chunks_indexed || 0));
    } catch (e: any) {
      setRagFeedback({ type: 'error', message: e.message || 'Failed to ingest text' });
    } finally {
      setRagLoading(false);
    }
  };

  const handleIngestPdf = async () => {
    if (!ragFile || !character) return;
    setRagLoading(true);
    setRagFeedback(null);
    try {
      const res = await ingestPdf(character.id, ragFile);
      setRagFeedback({ type: 'success', message: `Parsed "${res.filename}" (${res.chunks_indexed} chunks)!` });
      setRagFile(null);
      setRagChunks((prev) => prev + (res.chunks_indexed || 0));
    } catch (e: any) {
      setRagFeedback({ type: 'error', message: e.message || 'Failed to ingest PDF' });
    } finally {
      setRagLoading(false);
    }
  };

  const handleIngestUrl = async () => {
    if (!ragUrl.trim() || !character) return;
    setRagLoading(true);
    setRagFeedback(null);
    try {
      const res = await ingestUrl(character.id, ragUrl);
      setRagFeedback({ type: 'success', message: `Scraped & indexed ${res.chunks_indexed} chunks!` });
      setRagUrl('');
      setRagChunks((prev) => prev + (res.chunks_indexed || 0));
    } catch (e: any) {
      setRagFeedback({ type: 'error', message: e.message || 'Failed to scrape URL' });
    } finally {
      setRagLoading(false);
    }
  };

  const handleClearRag = async () => {
    if (!character || !window.confirm(`Clear all custom knowledge for ${character.name}?`)) return;
    try {
      await clearKnowledge(character.id);
      setRagChunks(0);
      setRagFeedback({ type: 'success', message: 'Knowledge base cleared.' });
    } catch (e: any) {
      setRagFeedback({ type: 'error', message: e.message });
    }
  };

  if (loading || !character) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl animate-spin">
          📜
        </div>
        <p className="font-cinzel text-sm text-slate-300">Summoning literary persona...</p>
      </div>
    );
  }

  const activePresets = whatIfPresets[character.id] || [
    "What if you chose forgiveness instead of vengeance?",
    "What if you abandoned your title and fled with your lover?",
    "What if you knew the prophecy was false all along?"
  ];

  return (
    <div className={`h-[calc(100vh-4rem)] flex flex-col transition-colors duration-500 ${
      whatIfMode ? 'bg-[#0f0b14]' : 'bg-[#0a0c13]'
    }`}>
      {/* What If Mode Indicator Bar */}
      {whatIfMode && (
        <div className="bg-gradient-to-r from-purple-950/80 via-amber-950/80 to-purple-950/80 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold tracking-wide uppercase text-[11px]">
              Counterfactual Simulation Active:
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Exploring alternate fates &amp; ethics contrary to original text
            </span>
          </div>
          <button
            onClick={() => setWhatIfMode(false)}
            className="text-[11px] underline hover:text-white"
          >
            Disable
          </button>
        </div>
      )}

      {/* Main Chat Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Column */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#0d1019]/90 backdrop-blur-md flex items-center justify-between gap-2">
            {/* Left: Character Info & Switcher */}
            <div className="flex items-center space-x-3 min-w-0">
              <Link
                to="/characters"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Back to characters"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow">
                <span>{character.emoji || '📜'}</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-cinzel text-base sm:text-lg font-bold text-slate-100 truncate">
                    {character.name}
                  </h2>
                  {ragChunks > 0 && (
                    <span 
                      title={`${ragChunks} chunks in vector memory`}
                      className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Database className="w-2.5 h-2.5" />
                      {ragChunks} RAG
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {character.work} <span className="text-slate-600">•</span> {character.author}
                </p>
              </div>
            </div>

            {/* Right: Mode Controls & Panel Toggle */}
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <div className="relative hidden sm:flex items-center">
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="pl-7 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer font-medium"
                >
                  <option value="auto">Auto-Detect</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* What If Toggle */}
              <button
                onClick={() => setWhatIfMode(!whatIfMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  whatIfMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-amber-300'
                }`}
                title="Toggle counterfactual 'What If?' mode"
              >
                <Flame className={`w-3.5 h-3.5 ${whatIfMode ? 'text-slate-950 fill-slate-950' : 'text-amber-400'}`} />
                <span className="hidden sm:inline">What If?</span>
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 transition-colors"
                title="Clear current session"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Toggle Sidebar */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg border transition-colors ${
                  sidebarOpen 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                }`}
                title="Toggle Literary Dossier & Knowledge Panel"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div 
            ref={chatContainerRef}
            onScroll={handleContainerScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center p-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-4xl mb-4 shadow-xl">
                  <span>{character.emoji || '📜'}</span>
                </div>

                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                  Audience with {character.name}
                </h3>
                <p className="font-cormorant text-base sm:text-lg text-slate-300 italic mb-6">
                  "{character.description}"
                </p>

                {/* Starter Prompt Cards */}
                <div className="w-full text-left space-y-2">
                  <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inquire into their dramatic conflict:</span>
                  </p>
                  
                  {(whatIfMode ? activePresets : [
                    `Why did you struggle so intensely with your decisions in ${character.work}?`,
                    `How do you justify your actions in the climax of your story?`,
                    `What is your truest opinion of those who betrayed or abandoned you?`,
                    `Speak to me of your deepest regrets.`
                  ]).slice(0, 3).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-3 rounded-xl glass-panel glass-panel-hover text-xs text-slate-200 flex items-center justify-between group"
                    >
                      <span className="italic">“{prompt}”</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0 mt-0.5 shadow">
                        <span>{character.emoji || '📜'}</span>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all shadow-md ${
                        isUser
                          ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-sm selection:bg-black/30'
                          : msg.what_if
                          ? 'bg-[#181424] border border-purple-500/30 text-slate-100 rounded-tl-sm'
                          : 'bg-[#121624] border border-white/10 text-slate-100 rounded-tl-sm'
                      }`}
                    >
                      {/* Message Metadata Header */}
                      <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-black/10 border-white/5 text-[11px]">
                        <span className={`font-semibold ${isUser ? 'text-slate-900' : 'text-amber-400'}`}>
                          {isUser ? 'You' : character.name}
                        </span>

                        <div className="flex items-center gap-2 opacity-80">
                          {msg.what_if && !isUser && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              What-If
                            </span>
                          )}
                          <span className={`text-[10px] ${isUser ? 'text-slate-900/70' : 'text-slate-500'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Message Body Content */}
                      <div className={`whitespace-pre-wrap ${!isUser ? 'font-cormorant text-base sm:text-lg leading-relaxed text-slate-100' : 'font-sans text-sm'}`}>
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
                        )}
                      </div>

                      {/* Assistant Actions (Speech & Copy) */}
                      {!isUser && !msg.isStreaming && msg.content && (
                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleSpeech(msg)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                                speakingMessageId === msg.id
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'hover:bg-white/5 hover:text-slate-200'
                              }`}
                              title={speakingMessageId === msg.id ? "Stop voice narration" : "Listen in character voice"}
                            >
                              {speakingMessageId === msg.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span>Speaking...</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Read Aloud</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleCopyText(msg.id, msg.content)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 hover:text-slate-200 transition-colors"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div className="h-2" />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0d1019]/95 backdrop-blur-md">
            {/* Quick What-If preset pill suggestions if What-If mode is toggled on */}
            {whatIfMode && (
              <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Preset:</span>
                </span>
                {activePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(preset)}
                    className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] whitespace-nowrap transition-colors"
                  >
                    {preset.slice(0, 42)}...
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    whatIfMode 
                      ? `Ask ${character.name} an alternate history or ethical dilemma...`
                      : `Converse with ${character.name} in English, हिंदी, or ગુજરાતી...`
                  }
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none max-h-32"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isStreaming}
                className={`p-3 rounded-xl font-bold transition-all shadow-lg ${
                  !inputMessage.trim() || isStreaming
                    ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105'
                }`}
              >
                {isStreaming ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Collapsible Right Sidebar: Dossier & RAG Ingestion */}
        {sidebarOpen && (
          <div className="w-80 lg:w-96 border-l border-white/10 bg-[#0d1019] flex flex-col h-full overflow-hidden shrink-0">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-white/10 p-2 gap-1 bg-black/20">
              <button
                onClick={() => setActiveTab('dossier')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'dossier'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Literary Dossier</span>
              </button>

              <button
                onClick={() => setActiveTab('rag')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'rag'
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Knowledge (RAG)</span>
              </button>
            </div>

            {/* Tab 1: Dossier View */}
            {activeTab === 'dossier' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
                {/* Character Quick Info */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Era: <strong className="text-slate-200">{character.era}</strong></span>
                    <span>Language: <strong className="text-amber-300">{character.language}</strong></span>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-slate-300 font-cormorant text-sm leading-relaxed">
                    {character.background_summary}
                  </div>
                </div>

                {/* Speech Style & Personality */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Personality &amp; Mindset</span>
                    </h4>
                    <p className="text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                      {character.personality}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <span>Speech Delivery</span>
                    </h4>
                    <p className="text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                      {character.speech_style}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>Core Conflict</span>
                    </h4>
                    <p className="text-slate-300 italic bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                      "{character.core_conflict}"
                    </p>
                  </div>
                </div>

                {/* Iconic Quotes to inject into chat */}
                {character.key_quotes && character.key_quotes.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-yellow-400 mb-2 flex items-center gap-1">
                      <Quote className="w-3 h-3" />
                      <span>Click to Inquire About Quote:</span>
                    </h4>
                    <div className="space-y-2">
                      {character.key_quotes.map((quote, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(`Tell me the true meaning behind your words: "${quote}"`)}
                          className="w-full text-left p-2.5 rounded-xl bg-black/30 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-[11px] text-amber-100 font-cormorant text-sm italic transition-colors"
                        >
                          “{quote}”
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Live In-Chat RAG Ingestion */}
            {activeTab === 'rag' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Vector Knowledge Base</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px]">
                      {ragChunks} Chunks Indexed
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-300/80">
                    Upload supplementary chapters, critical essays, or Wikipedia URLs. Responses will be grounded in this text.
                  </p>
                </div>

                {ragFeedback && (
                  <div className={`p-2.5 rounded-xl text-[11px] flex items-center gap-1.5 ${
                    ragFeedback.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {ragFeedback.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{ragFeedback.message}</span>
                  </div>
                )}

                {/* Option A: Paste Raw Text */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Paste Custom Notes or Text</span>
                  </label>
                  <textarea
                    rows={3}
                    value={ragText}
                    onChange={(e) => setRagText(e.target.value)}
                    placeholder="Paste literary analysis, historical notes, or scene dialogue..."
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={handleIngestText}
                    disabled={!ragText.trim() || ragLoading}
                    className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors"
                  >
                    {ragLoading ? 'Ingesting...' : 'Ingest Text Chunk'}
                  </button>
                </div>

                {/* Option B: Upload PDF Document */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload Book PDF</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setRagFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-white/10 file:text-slate-200 file:text-xs hover:file:bg-white/20"
                  />
                  <button
                    onClick={handleIngestPdf}
                    disabled={!ragFile || ragLoading}
                    className="w-full py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors"
                  >
                    {ragLoading ? 'Parsing PDF...' : 'Ingest PDF File'}
                  </button>
                </div>

                {/* Option C: Scrape URL */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scrape Web Article URL</span>
                  </label>
                  <input
                    type="url"
                    value={ragUrl}
                    onChange={(e) => setRagUrl(e.target.value)}
                    placeholder="https://en.wikipedia.org/wiki/..."
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={handleIngestUrl}
                    disabled={!ragUrl.trim() || ragLoading}
                    className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors"
                  >
                    {ragLoading ? 'Scraping URL...' : 'Ingest URL'}
                  </button>
                </div>

                {/* Clear Knowledge */}
                {ragChunks > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={handleClearRag}
                      className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs transition-colors"
                    >
                      Clear {character.name}'s Knowledge Base
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
