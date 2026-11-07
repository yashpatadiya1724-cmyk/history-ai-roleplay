import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#080a0f] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📜</span>
            <span className="font-cinzel text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              LitEra
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A real-time, persona-grounded literature time capsule. Bringing timeless classical characters to life through Local AI &amp; Retrieval-Augmented Generation.
          </p>
          <div className="flex items-center space-x-2 text-xs text-amber-400/80 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Private &amp; Local Inference</span>
          </div>
        </div>

        {/* Characters Col */}
        <div>
          <h4 className="font-cinzel text-sm font-semibold text-slate-200 tracking-wider uppercase mb-3">
            Hall of Legends
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/chat/hamlet" className="hover:text-amber-300 transition-colors">
                Prince Hamlet <span className="text-slate-500">(Shakespeare)</span>
              </Link>
            </li>
            <li>
              <Link to="/chat/charandas_chor" className="hover:text-amber-300 transition-colors">
                Charandas Chor <span className="text-slate-500">(Habib Tanvir)</span>
              </Link>
            </li>
            <li>
              <Link to="/chat/devdas" className="hover:text-amber-300 transition-colors">
                Devdas <span className="text-slate-500">(Sarat Chandra)</span>
              </Link>
            </li>
            <li>
              <Link to="/chat/shakuntala" className="hover:text-amber-300 transition-colors">
                Shakuntala <span className="text-slate-500">(Kālidāsa)</span>
              </Link>
            </li>
            <li>
              <Link to="/chat/jogidas_khuman" className="hover:text-amber-300 transition-colors">
                Jogidas Khuman <span className="text-slate-500">(Jhaverchand Meghani)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Modules Col */}
        <div>
          <h4 className="font-cinzel text-sm font-semibold text-slate-200 tracking-wider uppercase mb-3">
            Interactive Engines
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/characters" className="hover:text-amber-300 transition-colors">
                Full Character Catalog (9 Personas)
              </Link>
            </li>
            <li>
              <Link to="/knowledge" className="hover:text-amber-300 transition-colors">
                RAG Knowledge Ingestion Vault
              </Link>
            </li>
            <li>
              <Link to="/story" className="hover:text-amber-300 transition-colors">
                Historical Story Quests &amp; Decisions
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-amber-300 transition-colors">
                Ollama &amp; ChromaDB Diagnostics
              </Link>
            </li>
          </ul>
        </div>

        {/* Technical Col */}
        <div>
          <h4 className="font-cinzel text-sm font-semibold text-slate-200 tracking-wider uppercase mb-3">
            Local Setup
          </h4>
          <div className="bg-[#121624] border border-white/5 rounded-xl p-3 space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-1.5 text-amber-400 font-sans font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Ollama Quickstart</span>
            </div>
            <p className="text-[11px] text-slate-400">Run local LLM daemon:</p>
            <code className="block bg-black/40 px-2 py-1 rounded text-amber-300 text-[11px] select-all">
              ollama run llama3
            </code>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 LitEra. Designed for literature research, education, and philosophical exploration.</p>
        <p className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>using Ollama, ChromaDB, FastAPI &amp; React</span>
        </p>
      </div>
    </footer>
  );
};
