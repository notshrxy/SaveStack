
// Fix: Use named import for Dexie to ensure proper type resolution of the class and its inherited methods
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { ContentItem } from '../types';

/**
 * SaveStackDB class extending Dexie.
 * We use a dedicated class to ensure type safety and lifecycle management.
 */
export class SaveStackDB extends Dexie {
  items!: Table<ContentItem, string>;

  constructor() {
    // Fix: super() initializes the base Dexie class with the database name
    super('SaveStackDB');
    // Fix: Ensure the version method is recognized by the TypeScript compiler on the instance
    this.version(1).stores({
      items: 'id, title, category, isChecked, dateAdded, lastInteracted'
    });
  }
}

// Singleton instance used throughout the app
export const db = new SaveStackDB();

export const dbService = {
  /**
   * Opens the database explicitly. Recommended before hydration.
   */
  async open() {
    // Fix: Check if the database is open before attempting to open it using standard Dexie methods
    if (!db.isOpen()) {
      return await db.open();
    }
    return db;
  },

  /**
   * Retrieves all items from the local Dexie database.
   */
  async getAllItems() {
    await this.open();
    return await db.items.toArray();
  },
  
  /**
   * Saves or updates an item in the database.
   */
  async saveItem(item: ContentItem) {
    await this.open();
    return await db.items.put(item);
  },
  
  /**
   * Deletes an item by its ID.
   */
  async deleteItem(id: string) {
    await this.open();
    return await db.items.delete(id);
  },
  
  /**
   * Updates specific fields of an existing item.
   */
  async updateItem(id: string, updates: Partial<ContentItem>) {
    await this.open();
    return await db.items.update(id, updates);
  },

  /**
   * Performs a bulk update within a transaction.
   */
  async bulkUpdate(ids: string[], updates: Partial<ContentItem>) {
    await this.open();
    // Fix: 'transaction' is a method on the Dexie instance used to perform multiple operations atomically with type safety
    return await db.transaction('rw', db.items, async () => {
      for (const id of ids) {
        await db.items.update(id, updates);
      }
    });
  }
};
