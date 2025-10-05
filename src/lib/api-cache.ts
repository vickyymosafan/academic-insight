/**
 * API Caching Utilities
 * Provides caching strategies for API calls to improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Create singleton instance
export const apiCache = new APICache();

// Run cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Fetch with cache wrapper
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    forceRefresh?: boolean;
  }
): Promise<T> {
  // Check if we should force refresh
  if (options?.forceRefresh) {
    apiCache.invalidate(key);
  }

  // Try to get from cache first
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  apiCache.set(key, data, options?.ttl);

  return data;
}

/**
 * Cache key generators for common API endpoints
 */
export const cacheKeys = {
  dashboardStats: () => 'dashboard:stats',
  students: (filters?: Record<string, any>) => 
    `students:list:${JSON.stringify(filters || {})}`,
  student: (id: string) => `students:detail:${id}`,
  courses: () => 'courses:list',
  grades: (studentId: string) => `grades:student:${studentId}`,
};
