import React, { useState } from 'react';
import { Group } from '../types';
import { Plus, X, Folder, Layers } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface GroupTabsProps {
  groups: Group[];
  currentGroupId: string | null; // null means "All Words"
  onSelectGroup: (id: string | null) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
}

const GroupTabs: React.FC<GroupTabsProps> = ({ 
  groups, 
  currentGroupId, 
  onSelectGroup, 
  onCreateGroup, 
  onDeleteGroup 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Groups</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* 'All Words' Tab */}
        <button
          onClick={() => onSelectGroup(null)}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentGroupId === null 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4 mr-2" />
          All Words
        </button>

        {/* User Groups */}
        {groups.map(group => (
          <div 
            key={group.id}
            className={`flex items-center pl-4 pr-2 py-2 rounded-full text-sm font-medium transition-all border ${
              currentGroupId === group.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <button onClick={() => onSelectGroup(group.id)} className="flex items-center mr-2">
              <Folder className="w-4 h-4 mr-2" />
              {group.name}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}
              className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-black ${
                currentGroupId === group.id ? 'text-indigo-200' : 'text-gray-400 hover:text-red-500'
              }`}
              title="Delete Group"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add Button */}
        {isCreating ? (
          <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-full border border-indigo-300 shadow-sm px-2 py-1">
            <input
              type="text"
              autoFocus
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Name..."
              className="w-24 text-sm border-none focus:ring-0 px-2 py-1 text-gray-700 placeholder-gray-400"
              onBlur={() => !newGroupName && setIsCreating(false)}
            />
            <button 
                type="submit"
                className="bg-indigo-100 text-indigo-600 rounded-full p-1 hover:bg-indigo-200"
            >
                <Plus className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupTabs;
