import React, { useState, useEffect } from 'react';
import type { StoryScene } from '../types';
import { 
  fetchStoryModules, 
  makeDecision 
} from '../services/api';
import { 
  Compass, 
  Sparkles, 
  Play, 
  RotateCcw, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StoryAdventurePage: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [playerRole] = useState('Protagonist');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [sceneHistory, setSceneHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  // Pre-configured rich historical adventure quests
  const defaultQuests = [
    {
      id: 101,
      title: "The Ghost's Vengeance on the Battlements of Elsinore",
      era: "1601 Denmark",
      description: "Midnight bells toll across Elsinore. The ghostly apparition of your father demands vengeance against King Claudius. Indecision or blood?",
      roles: ["Prince Hamlet", "Horatio", "Lord Chamberlain Polonius"],
      initialScene: {
        narrative: "You stand atop the cold stone battlements of Elsinore Castle. A bone-chilling fog rolls in from the Baltic Sea. Suddenly, the armored ghost of your murdered father materializes before you, pointing a spectral finger toward the throne room. 'Avenge my foul and most unnatural murder!' the ghost commands.",
        choices: [
          "Draw your sword and swear an immediate blood oath to slay King Claudius tonight.",
          "Demand proof and feign madness to observe the King's reaction during the upcoming play.",
          "Refuse the specter's bidding and seek council with the church priests at dawn."
        ]
      }
    },
    {
      id: 102,
      title: "The Four Absurd Vows of Charandas",
      era: "1975 Raipur",
      description: "A guru demands four impossible promises before giving you his blessings. Can you steal with supreme honesty?",
      roles: ["Charandas Chor", "The Royal Minister", "Havaldar"],
      initialScene: {
        narrative: "You kneel before the venerable village Guru after a daring midnight burglary. The Guru demands: 'You shall never eat from a golden platter, never lead a procession, never marry a queen, never accept a throne, and never tell a lie!' You nod in reckless confidence.",
        choices: [
          "Accept all five vows and set off to loot the royal treasury without uttering a single lie.",
          "Attempt to negotiate a loophole allowing white lies during police interrogations.",
          "Rob the Guru's ashram and flee into the forest as an outlaw without principles."
        ]
      }
    },
    {
      id: 103,
      title: "The Recognition of Shakuntala at Dushyanta's Court",
      era: "Classical Antiquity",
      description: "You arrive at the royal court carrying the child of King Dushyanta. But the sage's curse has erased his memory and your signet ring is lost in the river.",
      roles: ["Shakuntala", "Sage Kanva's Disciple", "Queen Mother"],
      initialScene: {
        narrative: "You step into the grand assembly hall of Hastinapura. King Dushyanta looks upon you with cold, bewildered eyes. The sacred ring given to you in the hermitage has vanished from your finger into the waters of Sachitirtha.",
        choices: [
          "Remind the King of the forest fawn that drank water only from your hands.",
          "Invoke the witness of the Sun, Moon, and Wind against his injustice.",
          "Turn away with royal dignity to raise your son Bharata in sage Maricha's sanctuary."
        ]
      }
    }
  ];

  useEffect(() => {
    fetchStoryModules();
  }, []);

  const handleStartQuest = async (quest: typeof defaultQuests[0]) => {
    setLoading(true);
    setSelectedModuleId(quest.id);
    setGameActive(true);
    setSceneHistory([quest.initialScene.narrative]);
    setCurrentScene(quest.initialScene);
    setSessionId(Date.now());
    setLoading(false);
  };

  const handleMakeDecision = async (choiceText: string) => {
    setLoading(true);
    try {
      if (sessionId && selectedModuleId && selectedModuleId < 100) {
        const res = await makeDecision(sessionId, choiceText, selectedModuleId, playerRole);
        if (res.scene) {
          setCurrentScene(res.scene);
          setSceneHistory((prev) => [...prev, choiceText, res.scene.narrative || '']);
        }
      } else {
        // Dynamic simulated story branching for interactive scenarios
        const isClimax = sceneHistory.length >= 4;
        let newNarrative = '';
        let nextChoices: string[] = [];

        if (isClimax) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          newNarrative = `Your choice: "${choiceText}" has altered the tapestry of literature forever! The consequences echo through the centuries, creating a new canon of tragic triumph. Your journey in this scenario concludes.`;
          nextChoices = [];
        } else {
          newNarrative = `You firmly chose: "${choiceText}". The court gasps in astonishment. Tensions mount as the dramatic stakes reach fever pitch. A messenger arrives with unexpected tidings that force your hand!`;
          nextChoices = [
            "Confront your adversary directly in the public square.",
            "Retreat to prepare your defenses and rally your loyal allies.",
            "Propose an unexpected truce to test their true intentions."
          ];
        }

        const nextScene: StoryScene = {
          narrative: newNarrative,
          choices: nextChoices
        };
        setCurrentScene(nextScene);
        setSceneHistory((prev) => [...prev, choiceText, newNarrative]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGameActive(false);
    setCurrentScene(null);
    setSceneHistory([]);
    setSessionId(null);
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Branching Historical Roleplay</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-slate-100 mb-3">
          Story Quests &amp; Decisions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Assume the role of classical characters at crucial turning points. Make critical ethical decisions and rewrite the outcome of dramatic history.
        </p>
      </div>

      {!gameActive ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultQuests.map((quest) => (
            <div
              key={quest.id}
              className="glass-panel glass-panel-hover p-6 rounded-3xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {quest.era}
                  </span>
                  <Crown className="w-4 h-4 text-amber-300" />
                </div>

                <h3 className="font-cinzel text-lg font-bold text-slate-100 mb-2">
                  {quest.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {quest.description}
                </p>

                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <span className="font-semibold text-slate-300">Playable Roles:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {quest.roles.map((r, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartQuest(quest)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Embark on Quest</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Active Roleplay Session View */
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between p-4 glass-panel rounded-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel font-bold text-sm text-slate-200">
                Active Scenario: Turn #{Math.floor(sceneHistory.length / 2) + 1}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Quit / Choose Another Quest</span>
            </button>
          </div>

          {/* Story Narrative Box */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#121624] to-[#0d1019] space-y-6">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <h4 className="font-cinzel text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>The Scene Unfolds</span>
              </h4>
              <p className="font-cormorant text-lg sm:text-xl text-slate-100 leading-relaxed italic">
                {currentScene?.narrative}
              </p>
            </div>

            {/* Decision Choices */}
            {currentScene?.choices && currentScene.choices.length > 0 ? (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="font-cinzel text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  What action do you take?
                </h4>
                <div className="space-y-2.5">
                  {currentScene.choices.map((choice, i) => (
                    <button
                      key={i}
                      disabled={loading}
                      onClick={() => handleMakeDecision(choice)}
                      className="w-full text-left p-4 rounded-2xl glass-panel glass-panel-hover border border-white/10 hover:border-amber-500/40 text-xs sm:text-sm text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {i + 1}
                        </span>
                        <span>{choice}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-cinzel text-xl font-bold text-slate-100">
                  Epilogue Reached
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your choices have left an indelible mark upon literary destiny.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Play Another Story Quest
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
