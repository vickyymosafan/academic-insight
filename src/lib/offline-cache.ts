/**
 * Offline Cache Utility
 * Provides functions to cache and retrieve data for offline use
 */

const CACHE_PREFIX = 'academic-insight-cache-';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Save data to cache with timestamp
 */
export function cacheData<T>(key: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

/**
 * Retrieve data from cache if not expired
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const age = Date.now() - cacheItem.timestamp;

    // Return null if cache is expired
    if (age > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
}

/**
 * Clear specific cache item
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

/**
 * Check if data exists in cache and is not expired
 */
export function isCached(key: string): boolean {
  return getCachedData(key) !== null;
}
