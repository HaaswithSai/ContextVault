import { Memory, CreateMemoryInput } from '../types/memory';

const STORAGE_KEY = 'context_vault_memories';

/**
 * Checks if the Chrome extension storage API is available.
 * Returns false when running in standard web/dev server environment.
 */
function isChromeStorageAvailable(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    Boolean(chrome.storage) &&
    Boolean(chrome.storage.local)
  );
}

/**
 * Low-level helper to get raw memories array from chrome.storage.local (or localStorage fallback).
 */
async function getRawMemories(): Promise<Memory[]> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        const data = result[STORAGE_KEY];
        if (Array.isArray(data)) {
          resolve(data as Memory[]);
        } else {
          resolve([]);
        }
      });
    });
  }

  // Fallback for Vite local dev preview / testing
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[ContextVault] Failed to read from localStorage:', err);
    return [];
  }
}

/**
 * Low-level helper to write raw memories array to chrome.storage.local (or localStorage fallback).
 */
async function setRawMemories(memories: Memory[]): Promise<void> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: memories }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }

  // Fallback for Vite local dev preview / testing
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error('[ContextVault] Failed to write to localStorage:', err);
    throw err;
  }
}

/**
 * Generates a unique ID using crypto.randomUUID or timestamp fallback.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 1. Save a new memory to storage.
 * Automatically assigns an ID and createdAt timestamp if not provided.
 * Prepends the new memory so newest items appear first.
 */
export async function saveMemory(input: CreateMemoryInput): Promise<Memory> {
  const memories = await getRawMemories();

  const newMemory: Memory = {
    id: input.id || generateId(),
    url: input.url || '',
    pageTitle: input.pageTitle || 'Untitled Page',
    selectedText: input.selectedText || '',
    surroundingContext: input.surroundingContext || '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    isFavorite: Boolean(input.isFavorite),
    createdAt: input.createdAt || Date.now(),
  };

  // Prepend new memory
  const updated = [newMemory, ...memories.filter((m) => m.id !== newMemory.id)];
  await setRawMemories(updated);

  return newMemory;
}

/**
 * 2. Get all memories stored in local storage, ordered newest first.
 */
export async function getAllMemories(): Promise<Memory[]> {
  const memories = await getRawMemories();
  return memories.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * 3. Search memories by query string (case-insensitive substring match).
 * Matches across selectedText, pageTitle, surroundingContext, tags, and URL.
 */
export async function searchMemories(query: string): Promise<Memory[]> {
  const memories = await getAllMemories();
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return memories;
  }

  return memories.filter((memory) => {
    const textMatch = memory.selectedText.toLowerCase().includes(trimmed);
    const titleMatch = memory.pageTitle.toLowerCase().includes(trimmed);
    const contextMatch = memory.surroundingContext.toLowerCase().includes(trimmed);
    const urlMatch = memory.url.toLowerCase().includes(trimmed);
    const tagMatch = memory.tags.some((tag) => tag.toLowerCase().includes(trimmed));

    return textMatch || titleMatch || contextMatch || urlMatch || tagMatch;
  });
}

/**
 * 4. Update tags for a specific memory by ID.
 * Returns the updated Memory or null if not found.
 */
export async function updateMemoryTags(id: string, tags: string[]): Promise<Memory | null> {
  const memories = await getRawMemories();
  const index = memories.findIndex((m) => m.id === id);

  if (index === -1) {
    return null;
  }

  const updatedMemory: Memory = {
    ...memories[index],
    tags: Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean))),
  };

  memories[index] = updatedMemory;
  await setRawMemories(memories);

  return updatedMemory;
}

/**
 * 5. Toggle the favorite status of a memory by ID.
 * Returns the updated Memory or null if not found.
 */
export async function toggleFavorite(id: string): Promise<Memory | null> {
  const memories = await getRawMemories();
  const index = memories.findIndex((m) => m.id === id);

  if (index === -1) {
    return null;
  }

  const updatedMemory: Memory = {
    ...memories[index],
    isFavorite: !memories[index].isFavorite,
  };

  memories[index] = updatedMemory;
  await setRawMemories(memories);

  return updatedMemory;
}

/**
 * Helper: Get a single memory by ID.
 */
export async function getMemoryById(id: string): Promise<Memory | null> {
  const memories = await getRawMemories();
  return memories.find((m) => m.id === id) || null;
}

/**
 * Helper: Delete a memory by ID.
 */
export async function deleteMemory(id: string): Promise<boolean> {
  const memories = await getRawMemories();
  const initialLength = memories.length;
  const filtered = memories.filter((m) => m.id !== id);

  if (filtered.length === initialLength) {
    return false;
  }

  await setRawMemories(filtered);
  return true;
}

/**
 * Helper: Clear all stored memories.
 */
export async function clearAllMemories(): Promise<void> {
  await setRawMemories([]);
}
