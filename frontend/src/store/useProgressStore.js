import { create } from "zustand";
import { getProgress } from "../api/progress";

const PROGRESS_CACHE_KEY = "ascend_progress";

function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgressCache(data) {
  try {
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures
  }
}

export const useProgressStore = create((set, get) => ({
  user: null,
  weekly: [],
  monthly: [],
  stats: null,

  loading: false,
  error: null,
  inFlight: false,
  requestPromise: null,

  fetchProgress: async () => {
    const cached = loadStoredProgress();
    if (cached) {
      set({
        user: cached.user,
        weekly: cached.weekly,
        monthly: cached.monthly,
        stats: cached.stats,
        loading: false,
        error: null,
      });
    } else {
      set({ loading: true, error: null });
    }

    if (get().requestPromise) {
      return get().requestPromise;
    }

    const requestPromise = (async () => {
      set({ inFlight: true });

      try {
        const data = await Promise.race([
          getProgress(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Progress request timed out.")), 8000);
          }),
        ]);

        set({
          user: data.user,
          weekly: data.weekly,
          monthly: data.monthly,
          stats: data.stats,
          loading: false,
          error: null,
        });
        saveProgressCache(data);
        return data;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load progress.";

        if (cached) {
          set({ loading: false, error: null });
        } else {
          set({ loading: false, error: message });
        }

        return null;
      } finally {
        set({ inFlight: false, requestPromise: null });
      }
    })();

    set({ requestPromise });
    return requestPromise;
  },
}));