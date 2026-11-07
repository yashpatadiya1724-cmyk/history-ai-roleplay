import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquare, 
  Database, 
  Activity, 
  Compass, 
  Settings, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { checkOllamaHealth } from '../services/api';

interface NavbarProps {
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const location = useLocation();
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const isUp = await checkOllamaHealth();
      if (mounted) setOllamaOnline(isUp);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: 'Characters', path: '/characters', icon: BookOpen },
    { name: 'Forge from Book ✨', path: '/forge', icon: Sparkles, highlight: true },
    { name: 'Chat Room', path: '/chat/hamlet', icon: MessageSquare },
    { name: 'Knowledge Vault', path: '/knowledge', icon: Database },
    { name: 'Story Quests', path: '/story', icon: Compass },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
  ];

  const isActive = (path: string) => {
    if (path === '/chat/hamlet' && location.pathname.startsWith('/chat')) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0c13]/85 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0d1019] rounded-[10px] flex items-center justify-center">
                <span className="text-xl transform group-hover:scale-110 transition-transform">📜</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-cinzel text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                  LitEra
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
                Classical Literature Time Capsule
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : link.highlight
                      ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active || link.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status & Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Ollama Health Pill */}
            <div 
              title={ollamaOnline ? "Ollama Local LLM is Connected" : "Ollama connection pending (Run: ollama serve)"}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                ollamaOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              <span>{ollamaOnline ? 'Ollama Online' : 'Local AI Ready'}</span>
            </div>

            {/* Quick Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
              title="API & Engine Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0d1019]/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className={`w-2.5 h-2.5 rounded-full ${ollamaOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{ollamaOnline ? 'Ollama Online' : 'AI Offline / Preview Mode'}</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings?.();
              }}
              className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-300"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
