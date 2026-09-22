/**
 * Client-side caching utility using localStorage with stale-while-revalidate support.
 * FocusDay performance cache - MongoDB/API remains the source of truth.
 */

const CACHE_VERSION = 1;
export const DEFAULT_CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Safely writes data to localStorage with metadata.
 * @param {string} key
 * @param {*} data
 * @param {number} [ttl=DEFAULT_CACHE_TTL]
 * @returns {boolean} Success status
 */
export function setCache(key, data, ttl = DEFAULT_CACHE_TTL) {
  if (typeof window === "undefined" || !key) return false;
  try {
    const payload = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      ttl,
      data,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    // Gracefully handle storage quota exceeded or disabled storage
    try {
      // If quota exceeded, attempt to clear old stale cache keys
      cleanStaleCache();
    } catch {}
    return false;
  }
}

/**
 * Safely reads cached data from localStorage.
 * @param {string} key
 * @param {object} [options]
 * @param {number} [options.maxAge]
 * @param {boolean} [options.allowStale=true] If true, returns data even if past TTL for immediate rendering
 * @returns {*|null} Cached data or null
 */
export function getCache(key, options = {}) {
  if (typeof window === "undefined" || !key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CACHE_VERSION || !parsed.timestamp) {
      removeCache(key);
      return null;
    }

    const { maxAge, allowStale = true } = options;
    const ttl = maxAge ?? parsed.ttl ?? DEFAULT_CACHE_TTL;
    const isStale = Date.now() - parsed.timestamp > ttl;

    if (isStale && !allowStale) {
      return null;
    }

    return parsed.data;
  } catch {
    // Corrupted cache: remove safely
    removeCache(key);
    return null;
  }
}

/**
 * Safely removes a specific cache key.
 * @param {string} key
 */
export function removeCache(key) {
  if (typeof window === "undefined" || !key) return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

/**
 * Removes all cached data for a specific user ID.
 * Ensures strict user isolation on logout or account switch.
 * @param {string} userId
 */
export function clearUserCache(userId) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const prefix = `focusday_cache_${userId}_`;
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.localStorage.removeItem(k);
    }
    window.localStorage.removeItem("focusday_auth_user");
  } catch {}
}

/**
 * Clears old or expired FocusDay cache entries to reclaim quota.
 */
function cleanStaleCache() {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const maxRetention = 24 * 60 * 60 * 1000; // 24 hours
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("focusday_cache_")) {
        try {
          const item = JSON.parse(window.localStorage.getItem(k));
          if (!item || item.version !== CACHE_VERSION || now - item.timestamp > maxRetention) {
            keysToRemove.push(k);
          }
        } catch {
          keysToRemove.push(k);
        }
      }
    }
    for (const k of keysToRemove) {
      window.localStorage.removeItem(k);
    }
  } catch {}
}
