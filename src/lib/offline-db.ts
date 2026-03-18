
import { openDB, IDBPDatabase } from 'idb';
import { Enterprise } from '@/app/lib/types';

/**
 * SMART OFFLINE ENGINE
 * Stores business records and search results in the browser so they work without internet.
 */

const DB_NAME = 'cameroon-zoom-cache';
const STORE_NAME = 'business-logs';
const VERSION = 1;

export const initOfflineDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

/**
 * SAVE A SINGLE BUSINESS
 */
export const saveBusinessToCache = async (business: Enterprise) => {
  try {
    const db = await initOfflineDB();
    await db.put(STORE_NAME, business);
  } catch (e) {
    console.warn("Cache write failed", e);
  }
};

/**
 * BULK SAVE BUSINESSES (From Search Results)
 */
export const saveMultipleToCache = async (businesses: Enterprise[]) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all([
      ...businesses.map(b => tx.store.put(b)),
      tx.done
    ]);
  } catch (e) {
    console.warn("Bulk cache failed", e);
  }
};

/**
 * GET A SINGLE CACHED BUSINESS
 */
export const getCachedBusiness = async (id: string): Promise<Enterprise | null> => {
  try {
    const db = await initOfflineDB();
    return await db.get(STORE_NAME, id);
  } catch (e) {
    return null;
  }
};

/**
 * SEARCH CACHE BY TOWN
 */
export const getCachedByCity = async (city: string): Promise<Enterprise[]> => {
  try {
    const db = await initOfflineDB();
    const all = await db.getAll(STORE_NAME);
    if (city === 'All Towns' || !city) return all;
    return all.filter(b => b.city === city);
  } catch (e) {
    return [];
  }
};
