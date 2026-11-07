import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { fetchCharacters } from '../services/api';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterModal } from '../components/CharacterModal';
import { 
  Sparkles, 
  MessageSquare, 
  Database, 
  Languages, 
  ArrowRight, 
  Flame, 
  Scroll, 
  Quote
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const heroQuotes = [
    { text: "To be, or not to be, that is the question.", author: "Prince Hamlet", work: "Hamlet" },
    { text: "I promised my Guru I would never tell a lie. Everything else is negotiable, but not the truth.", author: "Charandas Chor", work: "Habib Tanvir" },
    { text: "Kaun kambakht bardaasht karne ke liye peeta hai?", author: "Devdas", work: "Sarat Chandra Chattopadhyay" },
    { text: "Can a forest creeper survive when torn from the mango tree?", author: "Shakuntala", work: "Kālidāsa" },
    { text: "A poor man's dignity is like an earthen pot — one kick and it shatters.", author: "Hori Mahato", work: "Godan" },
  ];

  useEffect(() => {
    fetchCharacters().then((data) => {
      setCharacters(data);
      setLoading(false);
    });

    const quoteTimer = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % heroQuotes.length);
    }, 5000);

    return () => clearInterval(quoteTimer);
  }, []);

  const currentQuote = heroQuotes[activeQuoteIndex];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm shadow-amber-500/10 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Literature Time Capsule • Persona-Grounded AI</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.1] mb-6">
              Step Beyond The Page.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-500">
                Converse With History.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-cormorant text-lg sm:text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10 italic">
              Don't just read classical literature — challenge Hamlet on his indecision, debate honesty with Charandas Chor, or comfort Shakuntala in her exile.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/characters"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Explore Characters &amp; Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/knowledge"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 hover:text-white font-medium text-sm border border-white/15 transition-all"
              >
                <Database className="w-4 h-4 text-amber-400" />
                <span>RAG Knowledge Vault</span>
              </Link>
            </div>

            {/* Live Literary Quote Banner */}
            <div className="mt-14 max-w-xl mx-auto p-4 rounded-2xl glass-panel bg-black/40 border border-amber-500/20 shadow-xl transition-all duration-500">
              <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-medium mb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Quote className="w-3 h-3 text-amber-400" />
                  <span>Timeless Voices</span>
                </span>
                <span className="text-slate-500">{activeQuoteIndex + 1} of {heroQuotes.length}</span>
              </div>
              <p className="font-cormorant text-base sm:text-lg text-amber-100/95 italic leading-relaxed min-h-[50px] flex items-center justify-center text-center">
                “{currentQuote.text}”
              </p>
              <p className="text-right text-[11px] text-slate-400 mt-1">
                — <strong className="text-slate-200">{currentQuote.author}</strong> ({currentQuote.work})
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 border-y border-white/5 bg-[#0d1019]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-panel space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Scroll className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                9 Classical Personas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-configured with authentic historical voices from Shakespeare, Premchand, Kālidāsa, and Habib Tanvir.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                RAG Ingestion Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Feed your own PDFs, essays, and web URLs directly into ChromaDB to enrich character memory instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                "What If?" Scenarios
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore counterfactual ethics. What if Charandas broke his vow? What if Devdas married Paro?
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                Multilingual AI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic language detection supporting English, Hindi (हिंदी), and Gujarati (ગુજરાતી) natively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Characters Carousel / Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Curated Pantheon</span>
            </div>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-slate-100">
              Meet The Characters
            </h2>
          </div>
          <Link
            to="/characters"
            className="flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
          >
            <span>View All 9 Personas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl glass-panel animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.slice(0, 6).map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onInspect={(char) => setSelectedCharacter(char)}
              />
            ))}
          </div>
        )}
      </section>

      {/* "What If?" Counterfactual Feature Spotlight */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-amber-500/30 p-8 sm:p-12 bg-gradient-to-br from-[#151928] via-[#0d101a] to-[#1a1524]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Counterfactual Simulation Engine
            </span>

            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-slate-100">
              Rewrite The Canon with "What If?" Mode
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-cormorant text-lg">
              LitEra's dedicated counterfactual prompt engine invites you to disrupt classical fate. Ask Hamlet to strike King Claudius during prayer, or challenge Charandas Chor to break his sacred vow of honesty for the Queen's crown.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/chat/hamlet"
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-colors"
              >
                Try "What If?" with Hamlet
              </Link>
              <Link
                to="/chat/charandas_chor"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition-colors"
              >
                Challenge Charandas Chor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Inspect Modal */}
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
};
