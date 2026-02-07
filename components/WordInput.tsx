import React, { useState } from 'react';
import { Word } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Folder } from 'lucide-react';

interface WordInputProps {
  onAddWords: (words: Word[]) => void;
  currentGroupName?: string; // Display name of current group
}

const WordInput: React.FC<WordInputProps> = ({ onAddWords, currentGroupName }) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleParseAndAdd = () => {
    if (!inputText.trim()) return;

    const lines = inputText.split('\n');
    const newWords: Word[] = [];
    const now = Date.now();

    lines.forEach(line => {
      // Basic heuristic to split English and Chinese
      // Supports: "Apple 苹果", "Apple - 苹果", "Apple, 苹果"
      const cleaned = line.trim();
      if (!cleaned) return;

      // Split by common separators or first non-ascii character
      const separators = /[-–—,，\t]/;
      let parts = cleaned.split(separators);

      if (parts.length < 2) {
          // Fallback: Split by first space if no other separators
          const firstSpace = cleaned.indexOf(' ');
          if (firstSpace > 0) {
              parts = [cleaned.substring(0, firstSpace), cleaned.substring(firstSpace)];
          }
      }

      if (parts.length >= 2) {
        newWords.push({
          id: uuidv4(),
          english: parts[0].trim(),
          chinese: parts.slice(1).join(' ').trim(), // Join remaining parts in case Chinese has spaces
          selected: true,
          // groupId will be handled by parent based on current view
          createdAt: now,
          playCount: 0
        });
      }
    });

    if (newWords.length > 0) {
      onAddWords(newWords);
      setInputText('');
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-800 mr-3">1. Input Words</h2>
            {currentGroupName && (
                <span className="flex items-center text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                    <Folder className="w-3 h-3 mr-1" />
                    Adding to: {currentGroupName}
                </span>
            )}
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-600 font-medium text-sm hover:underline"
        >
          {isOpen ? 'Close Input' : 'Open Batch Input'}
        </button>
      </div>

      {isOpen && (
        <div className="animate-fade-in-down">
            <p className="text-sm text-gray-500 mb-2">
                Paste your words below. Format: <code>English Chinese</code> (one per line).
            </p>
            <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                placeholder="Example:&#10;Apple 苹果&#10;Banana 香蕉&#10;Computers 电脑"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex justify-end mt-3">
                <button
                    onClick={handleParseAndAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    Add to List
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default WordInput;
