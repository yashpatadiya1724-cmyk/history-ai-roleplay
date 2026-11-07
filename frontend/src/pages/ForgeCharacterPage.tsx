import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { extractCharactersFromText, extractCharactersFromPdf } from '../services/api';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Flame, 
  Quote, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ForgeCharacterPage: React.FC = () => {

  // Input states
  const [uploadMode, setUploadMode] = useState<'pdf' | 'text'>('pdf');
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [autoRag, setAutoRag] = useState(true);

  // Process states
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [forgedCharacters, setForgedCharacters] = useState<Character[]>([]);

  const handleForge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgedCharacters([]);

    if (uploadMode === 'pdf' && !pdfFile) {
      setError('Please select a PDF file of the book or manuscript.');
      return;
    }
    if (uploadMode === 'text' && !textContent.trim()) {
      setError('Please paste the book text or story excerpt.');
      return;
    }

    setLoading(true);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1400);

    try {
      let result;
      if (uploadMode === 'pdf' && pdfFile) {
        result = await extractCharactersFromPdf(pdfFile, bookTitle, authorName, autoRag);
      } else {
        result = await extractCharactersFromText(textContent, bookTitle, authorName, autoRag);
      }

      clearInterval(stepInterval);
      setCurrentStep(4);

      if (result.characters && result.characters.length > 0) {
        setForgedCharacters(result.characters);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error('No characters could be identified from the text. Try providing more detailed story excerpts.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Failed to analyze book and extract character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-md shadow-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Book-to-Persona Genesis</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-slate-100 mb-4 leading-tight">
          Upload Any Book.{' '}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
            Forge New AI Characters.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-cormorant text-lg">
          Upload any novel, historical text, biography, or PDF. Our AI reads the manuscript, extracts the protagonists with authentic psychology &amp; speech style, vectorizes the entire book into memory, and lets you speak with them immediately.
        </p>
      </div>

      {/* Main Container */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#121624] via-[#0d1019] to-[#151224]">
        {/* Ambient top glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input Form */}
        {!loading && forgedCharacters.length === 0 && (
          <form onSubmit={handleForge} className="space-y-6">
            {/* Mode Switcher */}
            <div className="flex items-center justify-center">
              <div className="bg-black/50 p-1 rounded-2xl border border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('pdf')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    uploadMode === 'pdf'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Book PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    uploadMode === 'text'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Text / Excerpt</span>
                </button>
              </div>
            </div>

            {/* Title & Author Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Book or Story Title <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Discovery of India, Pride and Prejudice, Chhatrapati Shivaji..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Author / Era <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Jawaharlal Nehru, Jane Austen, Classical Folklore..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Upload PDF Section */}
            {uploadMode === 'pdf' && (
              <div className="border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-3xl p-8 sm:p-12 text-center transition-all bg-black/20 group">
                <Upload className="w-12 h-12 text-amber-400/80 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-cinzel text-base font-bold text-slate-200 mb-1">
                  {pdfFile ? pdfFile.name : 'Select or Drop Book PDF'}
                </h4>
                <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
                  {pdfFile 
                    ? `Ready to scan ${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB manuscript.` 
                    : 'Upload complete novels, chapters, biographies, or plays in PDF format.'}
                </p>
                <label className="cursor-pointer inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-xs border border-white/15 transition-all">
                  <span>Choose PDF File</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Paste Text Section */}
            {uploadMode === 'text' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Paste Book Text, Dialogue, or Story Scenes
                </label>
                <textarea
                  rows={8}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste the book chapters, dialogue scenes, or narrative excerpts here..."
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-y"
                />
              </div>
            )}

            {/* Auto RAG vector checkbox */}
            <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
              <input
                type="checkbox"
                id="autorag"
                checked={autoRag}
                onChange={(e) => setAutoRag(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-black/40 border-white/20 cursor-pointer"
              />
              <label htmlFor="autorag" className="cursor-pointer">
                <strong>Automatically Vectorize Book into RAG Memory</strong> — Character will cite exact lines and scene details from this uploaded book.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Analyze Book &amp; Forge New Character Persona</span>
            </button>
          </form>
        )}

        {/* Step 2: Live AI Forge Progress Animation */}
        {loading && (
          <div className="py-12 px-4 max-w-md mx-auto text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/40 relative z-10 animate-pulse">
                📜
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-cinzel text-xl font-bold text-slate-100">
                Forging Literary Persona...
              </h3>
              <p className="text-xs text-slate-400">
                Reading book manuscript and synthesizing personality traits.
              </p>
            </div>

            {/* Progress indicators */}
            <div className="space-y-2.5 text-left text-xs">
              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                currentStep >= 1 ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' : 'bg-white/[0.02] border-white/5 text-slate-500'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />}
                <span>1. Parsing text manuscript &amp; chapters...</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                currentStep >= 2 ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200' : 'bg-white/[0.02] border-white/5 text-slate-500'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4 text-emerald-400" /> : currentStep === 2 ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> : <div className="w-4 h-4" />}
                <span>2. Extracting protagonist psychology, speech cadence &amp; core conflict...</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                currentStep >= 3 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' : 'bg-white/[0.02] border-white/5 text-slate-500'
              }`}>
                {currentStep >= 4 ? <Check className="w-4 h-4 text-emerald-400" /> : currentStep === 3 ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <div className="w-4 h-4" />}
                <span>3. Vectorizing book into ChromaDB RAG memory...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result Showcase & Instant Chat Entry */}
        {!loading && forgedCharacters.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase">
                <Check className="w-3.5 h-3.5" />
                <span>Genesis Complete!</span>
              </div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-100">
                New Character Persona Created!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                The character has been added to your local library and their memory is fully grounded in your uploaded book.
              </p>
            </div>

            {/* Created Characters Cards */}
            <div className="grid grid-cols-1 gap-6">
              {forgedCharacters.map((char) => (
                <div
                  key={char.id}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#181c2c] to-[#0f121e] space-y-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner">
                        <span>{char.emoji || '📜'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-cinzel text-2xl font-bold text-slate-100">
                            {char.name}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                            {char.era || 'Classical'}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{char.work}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{char.author}</span>
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/chat/${char.id}`}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Start Chatting with {char.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Character Traits Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                      <h5 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Personality</span>
                      </h5>
                      <p className="text-slate-300 leading-relaxed">{char.personality}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                      <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Quote className="w-3 h-3" />
                        <span>Speech Delivery</span>
                      </h5>
                      <p className="text-slate-300 leading-relaxed">{char.speech_style}</p>
                    </div>
                  </div>

                  {/* Core Conflict */}
                  {char.core_conflict && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-1 text-amber-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Core Conflict</span>
                      </div>
                      <p className="text-slate-200 italic font-cormorant text-base">
                        "{char.core_conflict}"
                      </p>
                    </div>
                  )}

                  {/* Key Quotes */}
                  {char.key_quotes && char.key_quotes.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <h5 className="font-bold text-yellow-400 uppercase tracking-wider text-[11px]">
                        Iconic Lines:
                      </h5>
                      {char.key_quotes.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-black/40 text-amber-100 font-cormorant text-base italic border border-white/5">
                          “{q}”
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setForgedCharacters([]);
                  setTextContent('');
                  setPdfFile(null);
                  setBookTitle('');
                  setAuthorName('');
                }}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Forge Another Character from a Book
              </button>

              <Link
                to="/characters"
                className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full Character Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
