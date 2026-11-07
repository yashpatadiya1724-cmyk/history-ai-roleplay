import React, { useState, useEffect } from 'react';
import { checkOllamaHealth, fetchCharacters, API_BASE } from '../services/api';
import type { Character } from '../types';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  RefreshCw, 
  Terminal, 
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [checking, setChecking] = useState(false);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    const start = performance.now();
    try {
      const isUp = await checkOllamaHealth();
      setOllamaOnline(isUp);
      const latency = Math.round(performance.now() - start);
      setBackendLatency(latency);
    } catch {
      setOllamaOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
    fetchCharacters().then(setCharacters);
  }, []);

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Telemetry &amp; Health</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-slate-100 mb-3">
          LitEra Engine Monitor
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Live monitoring of the FastAPI server, ChromaDB vector store, SQLite persistence, and local Ollama LLM pipeline.
        </p>
      </div>

      {/* Primary Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ollama LLM Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Local LLM Service
            </span>
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-3.5 h-3.5 rounded-full ${
              ollamaOnline ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-rose-400'
            }`} />
            <div>
              <div className="font-cinzel text-xl font-bold text-slate-100">
                {ollamaOnline ? 'Ollama Online' : 'Ollama Unreachable'}
              </div>
              <div className="text-[11px] text-slate-400">
                {ollamaOnline ? 'Model ready for streaming chat' : 'Run: `ollama serve` on host'}
              </div>
            </div>
          </div>
        </div>

        {/* Backend & Vector DB Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vector &amp; Ingestion DB
            </span>
            <Database className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            <div>
              <div className="font-cinzel text-xl font-bold text-slate-100">
                ChromaDB + SQLite
              </div>
              <div className="text-[11px] text-slate-400">
                all-MiniLM-L6-v2 Embeddings
              </div>
            </div>
          </div>
        </div>

        {/* Latency & API Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              API Endpoint Latency
            </span>
            <Server className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
            <div>
              <div className="font-cinzel text-xl font-bold text-slate-100">
                {backendLatency !== null ? `${backendLatency} ms` : 'Testing...'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Target: {API_BASE}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Characters Pantheon Inventory */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Loaded Personas ({characters.length})</span>
            </h3>
            <Link to="/characters" className="text-xs text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {characters.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">{c.emoji}</span>
                  <div>
                    <div className="font-bold text-slate-200">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.language}</div>
                  </div>
                </div>
                <Link
                  to={`/chat/${c.id}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-[11px]"
                >
                  Chat
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Server & Terminal Instructions */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Server Orchestration</span>
            </h3>
            <button
              onClick={runDiagnostics}
              disabled={checking}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
              <span>Re-check Health</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono">
              <div className="text-slate-400 text-[11px]">1. Start Local Ollama Server</div>
              <code className="text-amber-300 block select-all">
                ollama run llama3
              </code>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono">
              <div className="text-slate-400 text-[11px]">2. Start FastAPI Backend</div>
              <code className="text-emerald-300 block select-all">
                cd backend &amp;&amp; uvicorn main:app --reload --port 8000
              </code>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono">
              <div className="text-slate-400 text-[11px]">3. Frontend Dev Server</div>
              <code className="text-indigo-300 block select-all">
                npm run dev
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
