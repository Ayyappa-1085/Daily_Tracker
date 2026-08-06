import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
const responseCache = new Map();
const pendingRequests = new Map();
const CACHE_TTL_MS = 10_000;

function buildCacheKey(config) {
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${config.method?.toUpperCase() || "GET"}:${config.url || ""}:${params}`;
}

function getCacheEntry(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ascend_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.method?.toLowerCase() === "get") {
    const cacheKey = buildCacheKey(config);
    const cached = getCacheEntry(cacheKey);
    if (cached) {
      return Promise.reject({ __cachedResponse: cached.value });
    }

    if (pendingRequests.has(cacheKey)) {
      return Promise.reject({ __pendingRequest: pendingRequests.get(cacheKey) });
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config.method?.toLowerCase() === "get") {
      const cacheKey = buildCacheKey(res.config);
      responseCache.set(cacheKey, {
        value: res,
        timestamp: Date.now(),
      });
      pendingRequests.delete(cacheKey);
    }
    return res;
  },
  (err) => {
    if (err.__cachedResponse) {
      return Promise.resolve(err.__cachedResponse);
    }

    if (err.__pendingRequest) {
      return err.__pendingRequest;
    }

    if (err.response?.status === 401) {
      localStorage.removeItem("ascend_token");
      localStorage.removeItem("ascend_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

const originalGet = api.get.bind(api);
api.get = (url, config) => {
  const cacheKey = buildCacheKey({ method: "get", url, params: config?.params });
  const cached = getCacheEntry(cacheKey);
  if (cached) {
    return Promise.resolve(cached.value);
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = originalGet(url, config).then((response) => {
    responseCache.set(cacheKey, { value: response, timestamp: Date.now() });
    pendingRequests.delete(cacheKey);
    return response;
  }).catch((error) => {
    pendingRequests.delete(cacheKey);
    throw error;
  });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export default api;
