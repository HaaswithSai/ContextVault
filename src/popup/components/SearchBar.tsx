import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  resultCount,
  totalCount,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onChange('');
    }
  };

  return (
    <div className="relative px-4 pt-3 pb-2 bg-slate-950/90 backdrop-blur-sm sticky top-[49px] z-10">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search quotes, titles, tags..."
          className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 transition-all outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-1.5 px-0.5 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            Found <strong className="text-indigo-300 font-semibold">{resultCount}</strong> of{' '}
            {totalCount}
          </span>
          <span className="text-slate-500 font-mono text-[9px]">ESC to clear</span>
        </div>
      )}
    </div>
  );
};
