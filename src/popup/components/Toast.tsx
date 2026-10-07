import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-slide-up">
      <div className="px-3 py-1.5 rounded-full bg-slate-900/95 border border-indigo-500/40 text-indigo-200 text-xs font-medium flex items-center gap-1.5 shadow-xl shadow-slate-950/80 backdrop-blur-md">
        {type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        {type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
        {type === 'info' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
        <span>{message}</span>
      </div>
    </div>
  );
};
