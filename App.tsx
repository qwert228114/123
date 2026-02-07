import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Word, AppState, PlayerSettings, Group } from './types';
import WordInput from './components/WordInput';
import WordList from './components/WordList';
import PlayerControls from './components/PlayerControls';
import GroupTabs from './components/GroupTabs';
import StatsView from './components/StatsView'; 
import { BarChart2, LayoutList } from 'lucide-react';
import { speakWordSequence, stopSpeaking } from './services/ttsService';

const App: React.FC = () => {
  // --- State ---
  // Initial demo words with updated structure
  const [words, setWords] = useState<Word[]>([
    { id: uuidv4(), english: "Serendipity", chinese: "机缘凑巧", selected: true, createdAt: Date.now() - 10000000, playCount: 5 },
    { id: uuidv4(), english: "Ephemeral", chinese: "转瞬即逝的", selected: true, createdAt: Date.now() - 5000000, playCount: 2 },
    { id: uuidv4(), english: "Resilience", chinese: "韧性", selected: true, createdAt: Date.now(), playCount: 0 },
  ]);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'stats'>('home');

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);
  
  // Default Settings
  const [settings, setSettings] = useState<PlayerSettings>({ 
    durationMinutes: 5,
    playbackRate: 1.0,
    sequence: ['english', 'chinese', 'english', 'english']
  });
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // --- Refs for Loop Management ---
  const isPlayingRef = useRef(false);
  const timerIntervalRef = useRef<number | null>(null);
  const activeWordListRef = useRef<Word[]>([]);
  const currentIndexRef = useRef(0);

  // --- Derived State ---
  const visibleWords = useMemo(() => {
    if (currentGroupId === null) return words;
    return words.filter(w => w.groupId === currentGroupId);
  }, [words, currentGroupId]);

  const currentGroup = groups.find(g => g.id === currentGroupId);

  // --- Handlers ---

  const handleAddWords = (newWords: Word[]) => {
    const wordsWithGroup = newWords.map(w => ({
        ...w,
        groupId: currentGroupId || undefined
    }));
    setWords(prev => [...prev, ...wordsWithGroup]);
  };

  const handleToggleSelect = (id: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, selected: !w.selected } : w));
  };

  const handleDelete = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const handleToggleAll = (select: boolean) => {
      const visibleIds = new Set(visibleWords.map(w => w.id));
      setWords(prev => prev.map(w => 
          visibleIds.has(w.id) ? { ...w, selected: select } : w
      ));
  };

  const handleMoveToGroup = (wordId: string, groupId: string | null) => {
      setWords(prev => prev.map(w => 
          w.id === wordId ? { ...w, groupId: groupId || undefined } : w
      ));
  };

  const handleImportWords = (wordIds: string[]) => {
      if (!currentGroupId) return;
      setWords(prev => prev.map(w => 
          wordIds.includes(w.id) ? { ...w, groupId: currentGroupId } : w
      ));
  };

  const handleCreateGroup = (name: string) => {
      const newGroup: Group = { id: uuidv4(), name };
      setGroups(prev => [...prev, newGroup]);
      setCurrentGroupId(newGroup.id);
  };

  const handleDeleteGroup = (id: string) => {
      if (currentGroupId === id) setCurrentGroupId(null);
      setGroups(prev => prev.filter(g => g.id !== id));
      setWords(prev => prev.map(w => w.groupId === id ? { ...w, groupId: undefined } : w));
  };

  // --- Core Loop Logic ---

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    setAppState(AppState.IDLE);
    setCurrentWordId(null);
    setTimeLeft(null);
    stopSpeaking();
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const playNextWord = useCallback(() => {
    if (!isPlayingRef.current) return;

    const list = activeWordListRef.current;
    if (list.length === 0) {
        stopPlayback();
        return;
    }

    if (currentIndexRef.current >= list.length) {
        currentIndexRef.current = 0;
    }

    const word = list[currentIndexRef.current];
    setCurrentWordId(word.id);

    // Get latest settings
    const currentSettings = settingsRef.current;

    // Check for empty sequence to prevent infinite fast loops
    if (!currentSettings.sequence || currentSettings.sequence.length === 0) {
        alert("Playback sequence is empty. Please add items in settings.");
        stopPlayback();
        return;
    }

    // Call TTS Service
    // We pass a callback for onItemStart to handle counting at the correct moment
    speakWordSequence(
        word, 
        currentSettings, 
        (item) => {
            // INCREMENT COUNT LOGIC
            // Increment only when an 'english' item actually starts playing.
            if (item === 'english') {
                 setWords(prev => prev.map(w => 
                    w.id === word.id ? { ...w, playCount: (w.playCount || 0) + 1 } : w
                ));
            }
        },
        () => {
            // onComplete
            if (isPlayingRef.current) {
                currentIndexRef.current++;
                setTimeout(() => {
                    playNextWord();
                }, 500);
            }
        }
    );

  }, [stopPlayback]); 

  const settingsRef = useRef(settings);
  useEffect(() => {
      settingsRef.current = settings;
  }, [settings]);

  const startPlayback = () => {
    const selectedWords = visibleWords.filter(w => w.selected);
    if (selectedWords.length === 0) return;

    activeWordListRef.current = selectedWords;
    currentIndexRef.current = 0;
    isPlayingRef.current = true;
    
    setAppState(AppState.PLAYING);
    setTimeLeft(settings.durationMinutes * 60);

    timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
            if (prev === null || prev <= 1) {
                stopPlayback();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    playNextWord();
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);


  return (
    <div className="min-h-screen pb-32 flex flex-col items-center">
      
      {/* Header with Navigation */}
      <header className="w-full bg-white border-b border-gray-200 py-4 mb-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Vocab<span className="text-indigo-600">Loop</span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
                Offline spaced repetition
            </p>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setCurrentView('home')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === 'home' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutList className="w-4 h-4 mr-2" />
                Player
              </button>
              <button 
                onClick={() => setCurrentView('stats')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === 'stats' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Statistics
              </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl px-4 flex-grow">
        
        {currentView === 'home' ? (
            <>
                {/* Status Banner */}
                {appState === AppState.PLAYING && (
                <div className="mb-6 bg-indigo-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-1 h-6 bg-white rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                            <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                        </div>
                        <span className="font-medium">
                            Playing {currentGroup ? `group: ${currentGroup.name}` : 'all words'}...
                        </span>
                    </div>
                </div>
                )}

                <WordInput 
                    onAddWords={handleAddWords} 
                    currentGroupName={currentGroup?.name}
                />
                
                <GroupTabs 
                    groups={groups}
                    currentGroupId={currentGroupId}
                    onSelectGroup={setCurrentGroupId}
                    onCreateGroup={handleCreateGroup}
                    onDeleteGroup={handleDeleteGroup}
                />

                <WordList 
                    words={visibleWords}
                    allWords={words}
                    groups={groups}
                    currentWordId={currentWordId}
                    currentGroupId={currentGroupId}
                    onToggleSelect={handleToggleSelect}
                    onDelete={handleDelete}
                    onToggleAll={handleToggleAll}
                    onMoveToGroup={handleMoveToGroup}
                    onImportWords={handleImportWords}
                />
            </>
        ) : (
            <StatsView 
                words={words} 
                groups={groups} 
            />
        )}
      </main>

      {/* Player Controls - Only visible in Home View or when Playing */}
      {(currentView === 'home' || appState === AppState.PLAYING) && (
          <PlayerControls 
            appState={appState}
            settings={settings}
            timeLeft={timeLeft}
            onStart={startPlayback}
            onStop={stopPlayback}
            onSettingsChange={setSettings}
            hasSelectedWords={visibleWords.some(w => w.selected)}
          />
      )}
    </div>
  );
};

export default App;
