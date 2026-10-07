/**
 * Core Data Schema for Context Vault "Memory"
 */
export interface Memory {
  id: string;
  url: string;
  pageTitle: string;
  selectedText: string;
  surroundingContext: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number; // Unix timestamp in milliseconds
}

export type CreateMemoryInput = Omit<Memory, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: number;
};

export type UpdateMemoryInput = Partial<Omit<Memory, 'id' | 'createdAt'>>;

export interface StorageData {
  memories: Memory[];
}
