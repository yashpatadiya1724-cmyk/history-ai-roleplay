import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './pages/HomePage';
import { CharactersPage } from './pages/CharactersPage';
import { ChatPage } from './pages/ChatPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { StoryAdventurePage } from './pages/StoryAdventurePage';
import { DashboardPage } from './pages/DashboardPage';
import { ForgeCharacterPage } from './pages/ForgeCharacterPage';

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0a0c13] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar onOpenSettings={() => setSettingsOpen(true)} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/forge" element={<ForgeCharacterPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/story" element={<StoryAdventurePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>

        <Footer />

        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
