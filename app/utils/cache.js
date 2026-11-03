/**
 * High-performance client-side cache utility with Stale-While-Revalidate,
 * sessionStorage persistence, and network timeout protection.
 * Reduces mobile data transfer and eliminates blank loading screens on Render spin-up.
 */

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes fresh
const STALE_DURATION = 24 * 60 * 60 * 1000; // 24 hours stale
const memoryCache = new Map();

function getStorageKey(key) {
  return `prsnn_cache_${key}`;
}

function readStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(getStorageKey(key));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStorage(key, entry) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch {
    // quota exceeded or disabled, silently continue
  }
}

async function fetchFresh(cleanUrl, options, cacheKey, useCache = true) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(cleanUrl, {
      ...options,
      signal: options?.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (useCache && data) {
      const entry = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + CACHE_DURATION,
      };
      memoryCache.set(cacheKey, entry);
      writeStorage(cacheKey, entry);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    // On network failure or timeout, fallback to stored cache if available
    const fallback = readStorage(cacheKey);
    if (fallback && fallback.data) {
      return fallback.data;
    }
    return null;
  }
}

/**
 * Fetch data with caching, Stale-While-Revalidate, and timeout protection
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise} - Response data
 */
export const cachedFetch = async (url, options = {}, useCache = true) => {
  if (!url) return null;
  const cleanUrl = url.replace('undefined', '');
  const cacheKey = `${cleanUrl}-${JSON.stringify(options)}`;
  const now = Date.now();

  // 1. Check in-memory cache
  if (useCache) {
    const mem = memoryCache.get(cacheKey);
    if (mem && mem.expires > now) {
      return mem.data;
    }

    // 2. Check persistent sessionStorage
    const stored = readStorage(cacheKey);
    if (stored) {
      // Restore into memory
      memoryCache.set(cacheKey, stored);

      if (stored.expires > now) {
        return stored.data;
      }

      // If stale but within 24h, return stale immediately & trigger background revalidate
      if (now - stored.timestamp < STALE_DURATION) {
        fetchFresh(cleanUrl, options, cacheKey, true).catch(() => {});
        return stored.data;
      }
    }
  }

  // 3. Fetch fresh data with 12s timeout
  return await fetchFresh(cleanUrl, options, cacheKey, useCache);
};

/**
 * Clear cache for a specific key or all keys
 */
export const clearCache = (key = null) => {
  if (key) {
    memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(getStorageKey(key));
      } catch {}
    }
  } else {
    memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith('prsnn_cache_')) {
            sessionStorage.removeItem(k);
          }
        });
      } catch {}
    }
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
};

export default cachedFetch;
