import React, { useState, useEffect } from 'react';
import {
  saveMemory,
  getAllMemories,
  searchMemories,
  toggleFavorite,
  updateMemoryTags,
  deleteMemory,
} from '../utils/storage';
import { Memory } from '../types/memory';
import {
  Bookmark,
  Sparkles,
  Search,
  Star,
  Tag,
  Trash2,
  Database,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const App: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load memories on mount
  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMemories();
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Add sample memory to test saveMemory
  const handleAddSample = async () => {
    const sample = await saveMemory({
      pageTitle: 'Understanding Chrome Extensions Manifest V3',
      url: 'https://developer.chrome.com/docs/extensions/mv3/intro/',
      selectedText:
        'Manifest V3 represents a shift in how extensions handle background scripts, security, and performance.',
      surroundingContext:
        'Extensions in Chrome are evolving. Manifest V3 represents a shift in how extensions handle background scripts, security, and performance. Service workers replace background pages.',
      tags: ['chrome', 'manifest-v3', 'web-dev'],
      isFavorite: true,
    });
    setMemories((prev) => [sample, ...prev.filter((m) => m.id !== sample.id)]);
    showStatus('Sample memory saved to storage!');
  };

  // Handle search test
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      await loadMemories();
    } else {
      const results = await searchMemories(q);
      setMemories(results);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavorite(id);
    if (updated) {
      setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showStatus(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    }
  };

  // Handle adding a test tag
  const handleAddTag = async (id: string, currentTags: string[]) => {
    const newTag = prompt('Enter a new tag:');
    if (newTag && newTag.trim()) {
      const updatedTags = [...currentTags, newTag.trim()];
      const updated = await updateMemoryTags(id, updatedTags);
      if (updated) {
        setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
        showStatus(`Tag "${newTag.trim()}" added!`);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const ok = await deleteMemory(id);
    if (ok) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
      showStatus('Memory deleted');
    }
  };

  return (
    <div className="w-[380px] min-h-[500px] bg-slate-950 text-slate-100 flex flex-col font-sans border border-slate-800 shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bookmark className="w-4 h-4 text-white fill-white/20" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Context Vault
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                v1.0 (Part 1)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Never lose anything valuable</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Storage Ready</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[420px]">
        {/* Status Notification Toast */}
        {statusMessage && (
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Verification Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Engine Status
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {memories.length} {memories.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            React + Tailwind CSS + Manifest V3 storage engine verified and operating.
          </p>
          <button
            onClick={handleAddSample}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            Save Sample Memory to Test
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search quotes, titles, tags..."
            className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Memory List */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="text-center py-6 text-xs text-slate-500">Loading storage...</div>
          ) : memories.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">No memories stored yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click "Save Sample Memory" above to test the storage engine.
              </p>
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {m.pageTitle}
                  </h2>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(m.id)}
                      title={m.isFavorite ? 'Remove favorite' : 'Add favorite'}
                      className="p-1 rounded hover:bg-slate-800 transition-colors"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          m.isFavorite
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      title="Delete memory"
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <blockquote className="text-xs text-indigo-200/90 italic bg-indigo-950/30 border-l-2 border-indigo-500 pl-2 py-1 rounded-r">
                  "{m.selectedText}"
                </blockquote>

                {/* Tags & Action row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                  <div className="flex flex-wrap gap-1 items-center">
                    {m.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                    <button
                      onClick={() => handleAddTag(m.id, m.tags)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 px-1 py-0.5"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>+Tag</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Part 1: Storage Engine</span>
        <span className="text-slate-500">Ready for Part 2 Context Menu</span>
      </footer>
    </div>
  );
};
