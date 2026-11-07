import React from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { 
  X, 
  MessageSquare, 
  BookOpen, 
  Quote, 
  Sparkles, 
  Flame, 
  Compass, 
  Scroll, 
  Database
} from 'lucide-react';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel bg-[#0d1019]/95 border border-amber-500/20 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-lg">
            <span>{character.emoji || '📜'}</span>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-100">
                {character.name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {character.era}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {character.language}
              </span>
            </div>
            <p className="text-sm text-amber-400/90 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span className="font-semibold">{character.work}</span>
              <span className="text-slate-500">by</span>
              <span className="text-slate-300">{character.author}</span>
            </p>
          </div>
        </div>

        {/* Modal Content Sections */}
        <div className="py-6 space-y-6">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Scroll className="w-4 h-4" />
              <span>Background &amp; Story Summary</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5 font-cormorant text-base">
              {character.background_summary || character.description}
            </p>
          </div>

          {/* Personality & Speech Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Personality &amp; Mindset</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {character.personality}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Speech &amp; Dialogue Style</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {character.speech_style}
              </p>
            </div>
          </div>

          {/* Core Conflict & Motivations */}
          <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>The Core Dramatic Conflict</span>
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed italic mb-3">
              "{character.core_conflict}"
            </p>
            <div className="pt-2 border-t border-white/5 text-xs text-slate-400">
              <strong className="text-slate-300">Drives &amp; Motivations: </strong>
              {character.motivations}
            </div>
          </div>

          {/* Key Quotes */}
          {character.key_quotes && character.key_quotes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-3 flex items-center gap-1.5">
                <Quote className="w-4 h-4" />
                <span>Iconic Passages &amp; Quotes</span>
              </h4>
              <div className="space-y-2">
                {character.key_quotes.map((quote, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-cormorant text-base text-amber-100/90 italic flex items-start gap-2.5"
                  >
                    <span className="text-amber-500 text-lg leading-none">“</span>
                    <span className="flex-1">{quote}</span>
                    <span className="text-amber-500 text-lg leading-none">”</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Themes & Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {character.themes?.map((theme, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                ✦ {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="w-4 h-4 text-amber-400" />
            <span>RAG-Enabled for Live Book Ingestion</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <Link
              to={`/chat/${character.id}`}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Begin Dialogue with {character.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
