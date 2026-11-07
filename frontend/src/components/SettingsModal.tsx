import React, { useState } from 'react';
import { X, Server, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { checkOllamaHealth } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('litera_api_url') || 'http://localhost:8000');
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setChecking(true);
    const ok = await checkOllamaHealth();
    setOllamaStatus(ok);
    setChecking(false);
  };

  const handleSave = () => {
    localStorage.setItem('litera_api_url', apiUrl.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-panel bg-[#0d1019] border border-amber-500/20 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-white/10">
          <Server className="w-5 h-5 text-amber-400" />
          <h3 className="font-cinzel text-lg font-bold text-slate-100">
            System &amp; LLM Configuration
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              FastAPI Backend Endpoint URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Default is <code className="text-amber-300">http://localhost:8000</code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Local Ollama Status</span>
              <button
                onClick={handleTestConnection}
                disabled={checking}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {ollamaStatus !== null && (
              <div className={`flex items-center space-x-1.5 p-2 rounded-lg text-[11px] ${
                ollamaStatus ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {ollamaStatus ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Ollama server detected and responding!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Ollama not detected. Ensure `ollama serve` is running.</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? 'Saved!' : 'Save & Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
