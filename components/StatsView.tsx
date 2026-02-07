import React, { useMemo, useState } from 'react';
import { Word, Group } from '../types';
import { Search, ArrowUpDown, Calendar, BarChart2 } from 'lucide-react';

interface StatsViewProps {
  words: Word[];
  groups: Group[];
}

type SortField = 'english' | 'createdAt' | 'playCount';
type SortDirection = 'asc' | 'desc';

const StatsView: React.FC<StatsViewProps> = ({ words, groups }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Helpers
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'All Words';
    return groups.find(g => g.id === groupId)?.name || 'Unknown';
  };

  // Filtering and Sorting
  const processedWords = useMemo(() => {
    let result = [...words];

    // Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(w => 
        w.english.toLowerCase().includes(lower) || 
        w.chinese.includes(lower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle undefined/null safety
      if (valA === undefined) valA = 0;
      if (valB === undefined) valB = 0;

      // Handle strings case insensitive
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [words, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for new field usually makes sense for stats
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1" />;
    return <ArrowUpDown className={`w-3 h-3 text-indigo-600 ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
            Statistics & History
        </h2>
        
        <div className="relative w-full sm:w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input 
                 type="text" 
                 placeholder="Search words..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
        </div>
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                    <th 
                        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('english')}
                    >
                        <div className="flex items-center">Word <SortIcon field="english" /></div>
                    </th>
                    <th className="p-4 hidden sm:table-cell">Meaning</th>
                    <th className="p-4 hidden sm:table-cell">Group</th>
                    <th 
                        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                    >
                        <div className="flex items-center">Added Date <SortIcon field="createdAt" /></div>
                    </th>
                    <th 
                        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors text-right"
                        onClick={() => handleSort('playCount')}
                    >
                        <div className="flex items-center justify-end">Play Count <SortIcon field="playCount" /></div>
                    </th>
                </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
                {processedWords.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                            No words found matching your search.
                        </td>
                    </tr>
                ) : (
                    processedWords.map(word => (
                        <tr key={word.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">
                                {word.english}
                                <div className="text-gray-500 sm:hidden mt-1 text-xs">{word.chinese}</div>
                            </td>
                            <td className="p-4 text-gray-600 hidden sm:table-cell">{word.chinese}</td>
                            <td className="p-4 text-gray-500 hidden sm:table-cell">
                                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                    {getGroupName(word.groupId)}
                                </span>
                            </td>
                            <td className="p-4 text-gray-500 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-gray-300" />
                                    {formatDate(word.createdAt)}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <span className={`font-mono font-bold px-2 py-1 rounded ${
                                    (word.playCount || 0) > 0 ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'
                                }`}>
                                    {word.playCount || 0}
                                </span>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
         Total Words: {processedWords.length}
      </div>
    </div>
  );
};

export default StatsView;
