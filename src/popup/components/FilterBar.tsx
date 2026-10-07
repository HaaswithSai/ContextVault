import React from 'react';
import { Star, Layers, Tag as TagIcon } from 'lucide-react';

interface FilterBarProps {
  activeTab: 'all' | 'favorites';
  onTabChange: (tab: 'all' | 'favorites') => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  allTags: string[];
  totalCount: number;
  favoriteCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  onTabChange,
  selectedTag,
  onTagSelect,
  allTags,
  totalCount,
  favoriteCount,
}) => {
  return (
    <div className="px-4 py-1.5 flex flex-col gap-1.5 border-b border-slate-800/60 bg-slate-950">
      {/* Primary Tabs */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            onTabChange('all');
            onTagSelect(null);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeTab === 'all' && !selectedTag
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>All ({totalCount})</span>
        </button>

        <button
          onClick={() => {
            onTabChange('favorites');
            onTagSelect(null);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeTab === 'favorites' && !selectedTag
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Star className={`w-3 h-3 ${favoriteCount > 0 ? 'text-amber-400 fill-amber-400/30' : ''}`} />
          <span>Favorites ({favoriteCount})</span>
        </button>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar text-[10px]">
          <span className="text-slate-500 shrink-0 flex items-center gap-0.5 mr-0.5">
            <TagIcon className="w-2.5 h-2.5" />
            Tags:
          </span>
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onTagSelect(isSelected ? null : tag)}
                className={`shrink-0 px-2 py-0.5 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-indigo-500 text-white border-indigo-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
