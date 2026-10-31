/**
 * Simple client-side cache utility for API responses
 * This reduces unnecessary API calls and improves page load times
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Fetch data with caching support
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise} - Response data
 */
export const cachedFetch = async (url, options = {}, useCache = true) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Check cache first
    if (useCache) {
        const cached = cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }
    }

    // Fetch fresh data
    try {
        // When running locally, NEXT_PUBLIC_API_URL may be empty causing a request to 'undefined/api/...'
        const cleanUrl = url.replace('undefined', '');
        
        const response = await fetch(cleanUrl, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the response
        if (useCache) {
            cache.set(cacheKey, {
                data,
                expires: Date.now() + CACHE_DURATION
            });
        }
        
        return data;
    } catch (error) {
        return null;
    }
};

/**
 * Clear cache for a specific key or all keys
 */
export const clearCache = (key = null) => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    return {
        size: cache.size,
        keys: Array.from(cache.keys())
    };
};

export default cachedFetch;
