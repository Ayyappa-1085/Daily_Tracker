const cache = new Map();

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCache(key, value, ttlMs) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function clearCache(prefix) {
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

function clearUserCache(userId) {
  clearCache(`dashboard:${userId}`);
  clearCache(`learning:${userId}`);
  clearCache(`progress:${userId}`);
}

module.exports = {
  getCache,
  setCache,
  clearCache,
  clearUserCache,
};
