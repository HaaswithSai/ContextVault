import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalCount }) => {
  return (
    <header className="px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25">
          <Bookmark className="w-3.5 h-3.5 text-white fill-white/20" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            Context Vault
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2.5 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>
            {totalCount} {totalCount === 1 ? 'memory' : 'memories'}
          </span>
        </div>
      </div>
    </header>
  );
};
