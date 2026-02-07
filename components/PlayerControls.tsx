import React, { useState } from 'react';
import { AppState, PlayerSettings, SequenceItem } from '../types';
import { Play, Square, Clock, AlertCircle, Settings, Plus, X, RotateCcw } from 'lucide-react';

interface PlayerControlsProps {
  appState: AppState;
  settings: PlayerSettings;
  timeLeft: number | null;
  onStart: () => void;
  onStop: () => void;
  onSettingsChange: (settings: PlayerSettings) => void;
  hasSelectedWords: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ 
  appState, 
  settings, 
  timeLeft, 
  onStart, 
  onStop, 
  onSettingsChange,
  hasSelectedWords
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const isPlaying = appState === AppState.PLAYING;

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddToSequence = (item: SequenceItem) => {
    onSettingsChange({
      ...settings,
      sequence: [...settings.sequence, item]
    });
  };

  const handleRemoveFromSequence = (index: number) => {
    const newSeq = [...settings.sequence];
    newSeq.splice(index, 1);
    onSettingsChange({
      ...settings,
      sequence: newSeq
    });
  };

  const handleResetSequence = () => {
    onSettingsChange({
        ...settings,
        sequence: ['english', 'chinese', 'english', 'english']
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      
      {/* Settings Panel Popover */}
      {showSettings && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-6 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Loop Settings</h3>
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Speed Control */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Playback Speed: <span className="text-indigo-600">{settings.playbackRate}x</span>
                        </label>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="1.2" 
                            step="0.1" 
                            value={settings.playbackRate}
                            onChange={(e) => onSettingsChange({...settings, playbackRate: parseFloat(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        {/* Custom scale labels with absolute positioning to match values */}
                        <div className="relative w-full h-5 mt-2 text-xs text-gray-400 font-medium">
                            <span className="absolute left-0">0.5x</span>
                            {/* 
                               Range is 0.5 to 1.2 (Total span 0.7). 
                               1.0 is 0.5 away from 0.5. 
                               Position % = (0.5 / 0.7) * 100 ≈ 71.4% 
                            */}
                            <span className="absolute left-[71.4%] transform -translate-x-1/2">1.0x</span>
                            <span className="absolute right-0">1.2x</span>
                        </div>
                    </div>

                    {/* Sequence Builder */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-semibold text-gray-700">Loop Pattern</label>
                             <button onClick={handleResetSequence} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                                <RotateCcw className="w-3 h-3 mr-1" /> Reset
                             </button>
                        </div>
                        
                        {/* Current Sequence Visualization */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px] flex flex-wrap gap-2 mb-3">
                            {settings.sequence.map((item, idx) => (
                                <div key={idx} className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm flex items-center shadow-sm">
                                    <span className="mr-2 font-medium text-gray-700">
                                        {item === 'english' && '🇬🇧 EN'}
                                        {item === 'chinese' && '🇨🇳 CN'}
                                        {item === 'spell' && '🔤 Spell'}
                                    </span>
                                    <button 
                                        onClick={() => handleRemoveFromSequence(idx)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {settings.sequence.length === 0 && (
                                <span className="text-sm text-gray-400 italic">Empty loop...</span>
                            )}
                        </div>

                        {/* Add Buttons */}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleAddToSequence('english')}
                                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-md text-sm font-medium transition-colors flex justify-center items-center"
                            >
                                <Plus className="w-3 h-3 mr-1" /> English
                            </button>
                            <button 
                                onClick={() => handleAddToSequence('chinese')}
                                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-md text-sm font-medium transition-colors flex justify-center items-center"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Chinese
                            </button>
                            <button 
                                onClick={() => handleAddToSequence('spell')}
                                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-md text-sm font-medium transition-colors flex justify-center items-center"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Spell
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Control Bar */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 relative">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Timer Config & Settings Toggle */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <select 
                      disabled={isPlaying}
                      value={settings.durationMinutes}
                      onChange={(e) => onSettingsChange({ ...settings, durationMinutes: Number(e.target.value) })}
                      className="bg-transparent border-none text-gray-800 font-bold focus:ring-0 cursor-pointer disabled:text-gray-400 text-sm"
                    >
                      <option value={1}>1 min</option>
                      <option value={5}>5 mins</option>
                      <option value={10}>10 mins</option>
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>
                  
                  {timeLeft !== null && (
                    <div className="text-2xl font-mono font-bold text-indigo-600">
                        {formatTime(timeLeft)}
                    </div>
                  )}
              </div>

              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Configure Loop"
              >
                 <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              {isPlaying ? (
                <button
                    onClick={onStop}
                    className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform transform active:scale-95 w-full sm:w-auto"
                >
                    <Square className="w-5 h-5 fill-current" />
                    <span>Stop</span>
                </button>
              ) : (
                <button
                    onClick={onStart}
                    disabled={!hasSelectedWords}
                    className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-full font-bold shadow-lg transition-transform transform active:scale-95 w-full sm:w-auto ${
                        hasSelectedWords 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Loop</span>
                </button>
              )}
            </div>
          </div>
          
          {!hasSelectedWords && !isPlaying && (
              <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-xs font-medium flex items-center shadow-sm whitespace-nowrap">
                <AlertCircle className="w-3 h-3 mr-1" />
                Select words to start
              </div>
          )}
      </div>
    </div>
  );
};

export default PlayerControls;
