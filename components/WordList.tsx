import React, { useState, useMemo } from 'react';
import { Word, Group } from '../types';
import { Trash2, CheckSquare, Square, FolderInput, Search, Plus, X } from 'lucide-react';

interface WordListProps {
  words: Word[]; // Visible words (in current group)
  allWords: Word[]; // All words in the app (for import)
  groups: Group[];
  currentWordId: string | null;
  currentGroupId: string | null;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleAll: (select: boolean) => void;
  onMoveToGroup: (wordId: string, groupId: string | null) => void;
  onImportWords: (wordIds: string[]) => void;
}

const WordList: React.FC<WordListProps> = ({ 
  words, 
  allWords,
  groups,
  currentWordId, 
  currentGroupId,
  onToggleSelect, 
  onDelete, 
  onToggleAll,
  onMoveToGroup,
  onImportWords
}) => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [selectedForImport, setSelectedForImport] = useState<Set<string>>(new Set());

  const selectedCount = words.filter(w => w.selected).length;

  // Filter words eligible for import (those NOT in the current group)
  const importableWords = useMemo(() => {
    if (!currentGroupId) return [];
    return allWords
      .filter(w => w.groupId !== currentGroupId)
      .filter(w => {
          if (!importSearch) return true;
          const searchLower = importSearch.toLowerCase();
          return w.english.toLowerCase().includes(searchLower) || 
                 w.chinese.includes(searchLower);
      });
  }, [allWords, currentGroupId, importSearch]);

  const toggleImportSelection = (id: string) => {
    const newSet = new Set(selectedForImport);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedForImport(newSet);
  };

  const handleImportSubmit = () => {
      onImportWords(Array.from(selectedForImport));
      setImportModalOpen(false);
      setSelectedForImport(new Set());
      setImportSearch('');
  };

  const currentGroupName = groups.find(g => g.id === currentGroupId)?.name;

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[500px] relative">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">2. Word List ({selectedCount})</h2>
        <div className="flex space-x-2">
            {currentGroupId && (
                <button
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-200 transition-colors mr-2"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Import
                </button>
            )}
            <button 
                onClick={() => onToggleAll(true)}
                className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
            >
                Select All
            </button>
            <button 
                onClick={() => onToggleAll(false)}
                className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
            >
                Clear
            </button>
        </div>
      </div>
      
      {words.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-400 flex flex-col items-center">
            <p className="mb-4">No words in this group.</p>
            {currentGroupId && (
                <button 
                    onClick={() => setImportModalOpen(true)}
                    className="text-indigo-600 hover:underline text-sm font-medium"
                >
                    Add words from other lists
                </button>
            )}
        </div>
      ) : (
        <div className="overflow-y-auto p-2 space-y-2 flex-grow">
            {words.map((word) => {
            const isActive = currentWordId === word.id;
            return (
                <div 
                key={word.id} 
                className={`flex items-center p-3 rounded-lg border transition-all duration-200 group ${
                    isActive 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.01]' 
                    : 'border-gray-100 hover:border-gray-300 bg-white'
                }`}
                >
                <button 
                    onClick={() => onToggleSelect(word.id)}
                    className="mr-3 text-gray-400 hover:text-indigo-600 focus:outline-none"
                >
                    {word.selected ? (
                        <CheckSquare className="w-6 h-6 text-indigo-600" />
                    ) : (
                        <Square className="w-6 h-6" />
                    )}
                </button>
                
                <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline">
                        <span className={`font-bold text-lg mr-2 truncate ${isActive ? 'text-indigo-800' : 'text-gray-800'}`}>
                            {word.english}
                        </span>
                        <span className={`text-sm truncate ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {word.chinese}
                        </span>
                    </div>
                </div>

                {/* Group Mover Dropdown */}
                <div className="relative group/mover ml-2">
                    <select
                        value={word.groupId || ''}
                        onChange={(e) => onMoveToGroup(word.id, e.target.value === '' ? null : e.target.value)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute inset-0 w-full h-full cursor-pointer z-10"
                        title="Move to group"
                    >
                        <option value="">(No Group)</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <button className="text-gray-300 hover:text-indigo-500 p-1">
                        <FolderInput className="w-4 h-4" />
                    </button>
                </div>

                <button 
                    onClick={() => onDelete(word.id)}
                    className="ml-1 text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Remove word"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                </div>
            );
            })}
        </div>
      )}
    </div>

      {/* IMPORT MODAL (Fixed Position over entire screen) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] animate-fade-in-up">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-800 text-lg">Add words to "{currentGroupName}"</h3>
                        <span className="text-xs text-gray-500">Select words from other groups to add here</span>
                    </div>
                    <button onClick={() => setImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search existing words by English or Chinese..." 
                            value={importSearch}
                            onChange={(e) => setImportSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto p-4 flex-grow space-y-2 bg-gray-50/50">
                    {importableWords.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            {importSearch ? 'No matching words found.' : 'No other words available to import.'}
                        </div>
                    ) : (
                        importableWords.map(word => {
                             const groupName = groups.find(g => g.id === word.groupId)?.name || 'Unassigned';
                             const isSelected = selectedForImport.has(word.id);
                             return (
                                <div 
                                    key={word.id}
                                    onClick={() => toggleImportSelection(word.id)}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer border shadow-sm transition-all ${
                                        isSelected
                                        ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className={`w-5 h-5 border-2 rounded mr-4 flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                                    }`}>
                                        {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-grow min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="font-bold text-gray-800 text-lg truncate">{word.english}</div>
                                        <div className="text-sm text-gray-600 truncate flex items-center">
                                            <span>{word.chinese}</span>
                                            <span className="text-xs text-gray-400 ml-auto bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {groupName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                             );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <span className="text-sm font-medium text-gray-500">
                        {selectedForImport.size} words selected
                    </span>
                    <button 
                        onClick={handleImportSubmit}
                        disabled={selectedForImport.size === 0}
                        className={`px-6 py-3 rounded-lg text-base font-bold shadow-md transition-all transform active:scale-95 flex items-center ${
                            selectedForImport.size > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Import Selected
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default WordList;
