import React, { useState, useEffect } from 'react';
import type { Character, UploadRecord } from '../types';
import { 
  fetchCharacters, 
  fetchKnowledgeInfo, 
  ingestText, 
  ingestPdf, 
  ingestUrl, 
  clearKnowledge 
} from '../services/api';
import { 
  Database, 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Check, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const KnowledgePage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('hamlet');
  const [activeType, setActiveType] = useState<'text' | 'pdf' | 'url'>('text');

  // Form states
  const [textInput, setTextInput] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);

  // Status & uploads
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [kbInfo, setKbInfo] = useState<{ total_chunks: number; uploads: UploadRecord[] }>({ total_chunks: 0, uploads: [] });

  useEffect(() => {
    fetchCharacters().then((chars) => {
      setCharacters(chars);
      if (chars.length > 0 && !selectedCharId) {
        setSelectedCharId(chars[0].id);
      }
    });
  }, []);

  const loadKbInfo = async (charId: string) => {
    try {
      const data = await fetchKnowledgeInfo(charId);
      setKbInfo({
        total_chunks: data.total_chunks || 0,
        uploads: data.uploads || []
      });
    } catch {
      setKbInfo({ total_chunks: 0, uploads: [] });
    }
  };

  useEffect(() => {
    if (selectedCharId) {
      loadKbInfo(selectedCharId);
    }
  }, [selectedCharId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharId) return;

    setLoading(true);
    setFeedback(null);

    try {
      if (activeType === 'text') {
        if (!textInput.trim()) throw new Error('Please enter text content.');
        const res = await ingestText(selectedCharId, textInput, sourceLabel || 'custom-notes');
        setFeedback({ type: 'success', message: `Successfully chunked and indexed ${res.chunks_indexed} chunks into ChromaDB!` });
        setTextInput('');
        setSourceLabel('');
      } else if (activeType === 'pdf') {
        if (!fileInput) throw new Error('Please select a PDF document.');
        const res = await ingestPdf(selectedCharId, fileInput);
        setFeedback({ type: 'success', message: `Successfully parsed "${res.filename}" (${res.chunks_indexed} chunks indexed)!` });
        setFileInput(null);
      } else if (activeType === 'url') {
        if (!urlInput.trim()) throw new Error('Please provide a valid web URL.');
        const res = await ingestUrl(selectedCharId, urlInput);
        setFeedback({ type: 'success', message: `Successfully scraped and ingested ${res.chunks_indexed} chunks from web source!` });
        setUrlInput('');
      }

      await loadKbInfo(selectedCharId);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Ingestion failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    const selectedChar = characters.find((c) => c.id === selectedCharId);
    if (!window.confirm(`Clear all custom knowledge embeddings for ${selectedChar?.name || selectedCharId}?`)) return;
    try {
      await clearKnowledge(selectedCharId);
      setFeedback({ type: 'success', message: 'Knowledge base cleared.' });
      await loadKbInfo(selectedCharId);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const selectedChar = characters.find((c) => c.id === selectedCharId);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Retrieval-Augmented Generation Hub</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-slate-100 mb-3">
          Knowledge Ingestion Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enrich the memory of any classical character by feeding whole book PDFs, research essays, commentary, or Wikipedia articles directly into ChromaDB vector memory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Character Selection & Status Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1. Select Target Character</span>
            </h3>

            <div className="space-y-2">
              {characters.map((char) => {
                const active = char.id === selectedCharId;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                      active
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10'
                        : 'bg-black/20 hover:bg-white/5 border border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{char.emoji || '📜'}</span>
                      <div>
                        <div className="text-xs font-bold">{char.name}</div>
                        <div className="text-[10px] text-slate-400">{char.work}</div>
                      </div>
                    </div>
                    {char.id === selectedCharId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Character Memory Card */}
          {selectedChar && (
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4 bg-gradient-to-br from-[#121628] to-[#0a0c13]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Current Vector Memory
                </span>
                <span className="text-xl">{selectedChar.emoji}</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold font-cinzel text-indigo-200">
                    {kbInfo.total_chunks}
                  </div>
                  <div className="text-[11px] text-slate-400">Total Indexed Chunks</div>
                </div>
                <Database className="w-8 h-8 text-indigo-400/50" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  to={`/chat/${selectedChar.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Test in Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {kbInfo.total_chunks > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs transition-colors"
                    title="Clear Vector Knowledge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ingestion Methods (Tabs + Form) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-slate-100">
                  2. Ingest Source Documents
                </h3>
                <p className="text-xs text-slate-400">
                  Feeding knowledge into <strong className="text-amber-300">{selectedChar?.name}</strong>'s memory
                </p>
              </div>

              {/* Source Mode Switcher */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
                <button
                  onClick={() => setActiveType('text')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeType === 'text' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => setActiveType('pdf')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeType === 'pdf' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>PDF Book</span>
                </button>
                <button
                  onClick={() => setActiveType('url')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeType === 'url' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>URL Scraper</span>
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {feedback && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeType === 'text' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Source Title / Tag
                    </label>
                    <input
                      type="text"
                      value={sourceLabel}
                      onChange={(e) => setSourceLabel(e.target.value)}
                      placeholder="e.g. Critical Commentary on Act 3, Chapter Notes, Soliloquy Analysis"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Text Body Content
                    </label>
                    <textarea
                      rows={8}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste historical records, dialogue transcripts, essays, or character background details..."
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-y"
                    />
                  </div>
                </>
              )}

              {activeType === 'pdf' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Upload PDF Manuscript or Book
                  </label>
                  <div className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-colors bg-black/20">
                    <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                    <p className="text-xs text-slate-300 mb-1">
                      {fileInput ? fileInput.name : 'Select or drag & drop a PDF document'}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-4">
                      PyMuPDF will extract pages, split by semantic paragraphs, and compute embeddings.
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                      className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeType === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Target Web URL to Scrape
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://en.wikipedia.org/wiki/Hamlet or any online literature article"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                  <p className="text-[11px] text-slate-400">
                    Extracts readable article content with BeautifulSoup and indexes chunks into ChromaDB.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing &amp; Vectorizing Knowledge...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Embed into ChromaDB Memory</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Upload History Table */}
          {kbInfo.uploads && kbInfo.uploads.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl space-y-3">
              <h3 className="font-cinzel text-sm font-bold text-slate-200">
                Recent Ingestion History ({selectedChar?.name})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 pb-2">
                      <th className="py-2">Type</th>
                      <th className="py-2">Source / Name</th>
                      <th className="py-2">Chunks</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {kbInfo.uploads.map((up) => (
                      <tr key={up.id}>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold">
                            {up.source_type}
                          </span>
                        </td>
                        <td className="py-2.5 font-medium truncate max-w-[200px]">{up.source_name}</td>
                        <td className="py-2.5 text-indigo-300 font-semibold">{up.chunk_count}</td>
                        <td className="py-2.5 text-slate-500 text-[11px]">{up.uploaded_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
