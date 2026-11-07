import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { fetchCharacters } from '../services/api';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterModal } from '../components/CharacterModal';
import { 
  Search, 
  BookOpen, 
  Globe, 
  X,
  Sparkles
} from 'lucide-react';

export const CharactersPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedEra, setSelectedEra] = useState<string>('All');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    fetchCharacters().then((data) => {
      setCharacters(data);
      setLoading(false);
    });
  }, []);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    characters.forEach((c) => {
      c.language.split('/').forEach((l) => langs.add(l.trim()));
    });
    return ['All', ...Array.from(langs)];
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch =
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.work.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLang =
        selectedLanguage === 'All' ||
        char.language.toLowerCase().includes(selectedLanguage.toLowerCase());

      const matchesEra =
        selectedEra === 'All' ||
        char.era.toLowerCase().includes(selectedEra.toLowerCase());

      return matchesSearch && matchesLang && matchesEra;
    });
  }, [characters, searchQuery, selectedLanguage, selectedEra]);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>The Classical Pantheon</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-slate-100 mb-3">
          Character Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Select any historical figure or dramatic protagonist to enter a real-time, grounded dialogue powered by Local LLMs and dynamic RAG.
        </p>

        <Link
          to="/forge"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload a Book &amp; Forge New Character ✨</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by character name, author, book, or philosophical theme..."
              className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clear all filters */}
          {(selectedLanguage !== 'All' || selectedEra !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedLanguage('All');
                setSelectedEra('All');
                setSearchQuery('');
              }}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Language & Era Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Globe className="w-3 h-3 text-amber-400" />
            <span>Language:</span>
          </span>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                selectedLanguage === lang
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                  : 'bg-black/20 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Characters */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl glass-panel animate-shimmer" />
          ))}
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-md mx-auto">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-cinzel text-lg font-bold text-slate-200 mb-1">
            No Characters Found
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            No characters match your search criteria. Try modifying your search keywords or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage('All');
              setSelectedEra('All');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
          >
            Show All Characters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onInspect={(char) => setSelectedCharacter(char)}
            />
          ))}
        </div>
      )}

      {/* Dossier Modal */}
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
};
