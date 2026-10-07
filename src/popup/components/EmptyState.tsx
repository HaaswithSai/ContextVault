import React from 'react';
import { SearchX, BookmarkPlus, Star, MousePointerClick } from 'lucide-react';

interface EmptyStateProps {
  type: 'empty' | 'no-search-results' | 'no-favorites' | 'no-tag-results';
  searchQuery?: string;
  tagName?: string;
  onClearFilters?: () => void;
  onAddSample?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  tagName,
  onClearFilters,
  onAddSample,
}) => {
  if (type === 'no-search-results') {
    return (
      <div className="py-12 px-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <SearchX className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-slate-200">No results found</h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
          No memories match <span className="text-indigo-300 font-mono">"{searchQuery}"</span>.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-favorites') {
    return (
      <div className="py-12 px-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
          <Star className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-slate-200">No favorites yet</h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
          Click the star icon on any memory card to pin it to your favorites.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            View all memories
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-tag-results') {
    return (
      <div className="py-12 px-6 flex flex-col items-center text-center">
        <h3 className="text-xs font-semibold text-slate-200">No memories tagged #{tagName}</h3>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Show all
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5 shadow-inner">
        <BookmarkPlus className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-bold text-slate-100">Your Vault is Empty</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
        Highlight any text on the web, right-click, and select{' '}
        <span className="text-indigo-300 font-semibold">"Save to MindClip"</span>.
      </p>

      <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-left w-full space-y-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <MousePointerClick className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Quick How-To:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
          <li>Select text on any webpage</li>
          <li>Right-click the selection</li>
          <li>Click <strong>Save to MindClip</strong></li>
        </ol>
      </div>

      {onAddSample && (
        <button
          onClick={onAddSample}
          className="mt-4 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
        >
          Add Sample Memory to Explore
        </button>
      )}
    </div>
  );
};
