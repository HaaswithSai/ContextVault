import React, { useState } from 'react';
import { Memory } from '../../types/memory';
import {
  ExternalLink,
  Star,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Globe,
} from 'lucide-react';
import { formatRelativeTime, extractDomain, openTab } from '../../utils/formatters';

interface MemoryCardProps {
  memory: Memory;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onFilterByTag?: (tag: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onToggleFavorite,
  onDelete,
  onUpdateTags,
  onFilterByTag,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const domain = extractDomain(memory.url);
  const timeAgo = formatRelativeTime(memory.createdAt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(memory.selectedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
    }
  };

  const handleAddTagSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !memory.tags.includes(trimmed)) {
      onUpdateTags(memory.id, [...memory.tags, trimmed]);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(
      memory.id,
      memory.tags.filter((t) => t !== tagToRemove)
    );
  };

  // Strictly open tab via chrome.tabs.create inside click handler
  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openTab(memory.url);
  };

  const hasDistinctContext =
    memory.surroundingContext &&
    memory.surroundingContext.trim() !== memory.selectedText.trim();

  return (
    <article className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm flex flex-col gap-2.5 group">
      {/* Header: Title, Domain, Date */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleTitleClick}
            title={`Open: ${memory.url}`}
            className="text-left font-semibold text-xs text-slate-100 hover:text-indigo-300 transition-colors line-clamp-1 flex items-center gap-1 group/title cursor-pointer w-full"
          >
            <span className="truncate">{memory.pageTitle || 'Untitled Page'}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/title:opacity-100 text-indigo-400 transition-opacity" />
          </button>

          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 hover:text-slate-400 truncate max-w-[150px]">
              <Globe className="w-2.5 h-2.5 shrink-0" />
              {domain}
            </span>
            <span>•</span>
            <time dateTime={new Date(memory.createdAt).toISOString()}>{timeAgo}</time>
          </div>
        </div>

        {/* Action Buttons: Star, Copy, Delete */}
        <div className="flex items-center gap-0.5 shrink-0 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/80">
          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(memory.id)}
            title={memory.isFavorite ? 'Unstar memory' : 'Star memory'}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Star
              className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                memory.isFavorite
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            title={isCopied ? 'Copied!' : 'Copy selected text'}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer relative"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale-in" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(memory.id)}
            title="Delete memory"
            className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prominent Selected Text Quote */}
      <blockquote className="text-xs text-slate-200 leading-relaxed bg-indigo-950/20 border-l-2 border-indigo-500 pl-2.5 py-1.5 rounded-r-md font-normal select-text">
        "{memory.selectedText}"
      </blockquote>

      {/* Surrounding Context (Collapsible) */}
      {hasDistinctContext && (
        <div className="text-[11px] text-slate-400 bg-slate-950/40 rounded-lg p-2 border border-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Surrounding Context
            </span>
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
            >
              <span>{showContext ? 'Less' : 'More'}</span>
              {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <p
            className={`mt-1 text-slate-400 leading-normal select-text ${
              showContext ? '' : 'line-clamp-2'
            }`}
          >
            {memory.surroundingContext}
          </p>
        </div>
      )}

      {/* Tag List & Inline Tag Creator */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/50">
        {memory.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-800 text-slate-300 pl-2 pr-1 py-0.5 rounded-md border border-slate-700/60 group/tag"
          >
            <button
              onClick={() => onFilterByTag && onFilterByTag(tag)}
              title={`Filter by #${tag}`}
              className="hover:text-indigo-300 cursor-pointer"
            >
              #{tag}
            </button>
            <button
              onClick={() => handleRemoveTag(tag)}
              title={`Remove tag #${tag}`}
              className="text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 rounded p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {/* Inline Add Tag */}
        {isAddingTag ? (
          <form onSubmit={handleAddTagSubmit} className="inline-flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onBlur={handleAddTagSubmit}
              placeholder="tag name..."
              className="w-20 px-1.5 py-0.5 bg-slate-950 border border-indigo-500 rounded text-[10px] text-slate-100 placeholder-slate-600 outline-none"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 px-1.5 py-0.5 rounded border border-dashed border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Tag</span>
          </button>
        )}
      </div>
    </article>
  );
};
