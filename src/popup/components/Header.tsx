import React from 'react';
import { Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalCount }) => {
  return (
    <header className="px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        <Logo size={28} />
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
