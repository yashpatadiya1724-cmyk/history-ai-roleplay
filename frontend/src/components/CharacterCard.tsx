import React from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { MessageSquare, BookOpen, Clock, Globe, Sparkles, Flame } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onInspect?: (character: Character) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onInspect }) => {
  return (
    <div className="group relative rounded-2xl glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between p-6 transition-all duration-300">
      {/* Ambient background glow on card */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Header: Emoji Avatar & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300">
              <span>{character.emoji || '📜'}</span>
            </div>
            {character.knowledge_base && character.knowledge_base.total_chunks > 0 && (
              <span 
                title={`${character.knowledge_base.total_chunks} custom RAG chunks indexed`}
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 border border-indigo-400 text-[10px] font-bold text-white shadow"
              >
                ⚡
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              {character.language}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {character.era}
            </span>
          </div>
        </div>

        {/* Character Title & Work */}
        <h3 className="font-cinzel text-xl font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
          {character.name}
        </h3>
        <p className="text-xs text-amber-400/90 font-medium mb-2.5 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          <span>{character.work}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 italic">{character.author}</span>
        </p>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {character.description}
        </p>

        {/* Core Conflict Highlight */}
        {character.core_conflict && (
          <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 mb-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-amber-300/90 font-semibold mb-0.5">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Core Dilemma:</span>
            </div>
            <p className="line-clamp-2 italic text-slate-300">
              "{character.core_conflict}"
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {character.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/5"
            >
              #{tag}
            </span>
          ))}
          {character.tags.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-500">
              +{character.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
        <Link
          to={`/chat/${character.id}`}
          className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-200"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Talk to {character.name.split(' ')[0]}</span>
        </Link>
        
        {onInspect && (
          <button
            onClick={() => onInspect(character)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
            title="Inspect full character profile & quotes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
        )}
      </div>
    </div>
  );
};
