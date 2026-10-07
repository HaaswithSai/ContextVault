import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Memory } from '../types/memory';
import {
  getAllMemories,
  saveMemory,
  toggleFavorite,
  deleteMemory,
  updateMemoryTags,
} from '../utils/storage';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { MemoryCard } from './components/MemoryCard';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // 1. Initial Data Fetch
  const fetchMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllMemories();
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
      showToast('Failed to load memories', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // 2. Computed Tags & Stats
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    memories.forEach((m) => {
      m.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [memories]);

  const favoriteCount = useMemo(() => {
    return memories.filter((m) => m.isFavorite).length;
  }, [memories]);

  // 3. Filter & Search Logic
  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      // Tab filter
      if (activeTab === 'favorites' && !memory.isFavorite) {
        return false;
      }

      // Tag filter
      if (selectedTag && !memory.tags.includes(selectedTag)) {
        return false;
      }

      // Search query filter (matches selectedText, pageTitle, surroundingContext, tags, url)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const textMatch = memory.selectedText.toLowerCase().includes(q);
        const titleMatch = memory.pageTitle.toLowerCase().includes(q);
        const contextMatch = memory.surroundingContext.toLowerCase().includes(q);
        const tagMatch = memory.tags.some((t) => t.toLowerCase().includes(q));
        const urlMatch = memory.url.toLowerCase().includes(q);

        if (!textMatch && !titleMatch && !contextMatch && !tagMatch && !urlMatch) {
          return false;
        }
      }

      return true;
    });
  }, [memories, activeTab, selectedTag, searchQuery]);

  // 4. Action Handlers (Optimistic Updates + Storage Persistence)

  const handleToggleFavorite = async (id: string) => {
    // Optimistic state update
    let isFav = false;
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          isFav = !m.isFavorite;
          return { ...m, isFavorite: !m.isFavorite };
        }
        return m;
      })
    );

    try {
      await toggleFavorite(id);
      showToast(isFav ? 'Pinned to favorites' : 'Removed from favorites', 'success');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showToast('Error updating favorite', 'error');
      fetchMemories(); // Rollback
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic deletion
    const backup = [...memories];
    setMemories((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteMemory(id);
      showToast('Memory deleted', 'info');
    } catch (err) {
      console.error('Failed to delete memory:', err);
      showToast('Error deleting memory', 'error');
      setMemories(backup); // Rollback
    }
  };

  const handleUpdateTags = async (id: string, newTags: string[]) => {
    // Optimistic update
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, tags: newTags } : m))
    );

    try {
      await updateMemoryTags(id, newTags);
      showToast('Tags updated', 'success');
    } catch (err) {
      console.error('Failed to update tags:', err);
      showToast('Error updating tags', 'error');
      fetchMemories(); // Rollback
    }
  };

  const handleAddSample = async () => {
    try {
      const sample = await saveMemory({
        pageTitle: 'Chrome Extensions Manifest V3 Guide',
        url: 'https://developer.chrome.com/docs/extensions/mv3/',
        selectedText:
          'Service workers replace background pages in MV3, providing improved security, reliability, and privacy.',
        surroundingContext:
          'Chrome Extensions Architecture: Service workers replace background pages in MV3, providing improved security, reliability, and privacy. They are event-driven and terminate when idle.',
        tags: ['chrome', 'manifest-v3', 'web-dev'],
        isFavorite: true,
      });

      setMemories((prev) => [sample, ...prev.filter((m) => m.id !== sample.id)]);
      showToast('Sample memory added to Vault!', 'success');
    } catch (err) {
      console.error('Failed to add sample:', err);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setSelectedTag(null);
  };

  return (
    <div className="w-[400px] h-[580px] max-h-[600px] bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Toast Notification */}
      <Toast message={toastMessage} type={toastType} />

      {/* Sticky Header */}
      <Header totalCount={memories.length} />

      {/* Sticky Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={filteredMemories.length}
        totalCount={memories.length}
      />

      {/* Filter Tabs & Tag Pills */}
      <FilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        allTags={allUniqueTags}
        totalCount={memories.length}
        favoriteCount={favoriteCount}
      />

      {/* Scrollable Memory List */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading Context Vault...</span>
          </div>
        ) : memories.length === 0 ? (
          <EmptyState type="empty" onAddSample={handleAddSample} />
        ) : filteredMemories.length === 0 ? (
          <EmptyState
            type={
              searchQuery
                ? 'no-search-results'
                : activeTab === 'favorites'
                ? 'no-favorites'
                : 'no-tag-results'
            }
            searchQuery={searchQuery}
            tagName={selectedTag || undefined}
            onClearFilters={handleClearFilters}
          />
        ) : (
          filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
              onUpdateTags={handleUpdateTags}
              onFilterByTag={(tag) => {
                setSelectedTag(tag);
                setActiveTab('all');
              }}
            />
          ))
        )}
      </main>
    </div>
  );
};
