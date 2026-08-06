import { create } from "zustand";
import api from "../api/axios";

const LEARNING_CACHE_KEY = "ascend_learning";

function loadStoredLearning() {
  try {
    const raw = localStorage.getItem(LEARNING_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLearningCache(data) {
  try {
    localStorage.setItem(LEARNING_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures
  }
}

export const useLearningStore = create((set, get) => ({
  questions: loadStoredLearning() || [],
  progress: null,
  status: "idle",
  error: null,
  inFlight: false,

  fetchLearning: async () => {
    const cached = loadStoredLearning();
    if (cached) {
      set({
        questions: cached,
        progress: {
          completed: cached.filter((question) => question.completed).length,
          total: cached.length,
        },
        status: "success",
        error: null,
      });
    } else {
      set({ status: "loading", error: null });
    }

    if (get().inFlight) return;
    set({ inFlight: true });

    try {
      const { data } = await api.get("/learning/questions");
      const nextQuestions = Array.isArray(data) ? data : [];

      set({
        questions: nextQuestions,
        progress: {
          completed: nextQuestions.filter((question) => question.completed).length,
          total: nextQuestions.length,
        },
        status: "success",
        error: null,
      });
      saveLearningCache(nextQuestions);
    } catch (err) {
      set({
        status: "error",
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to load learning roadmap.",
      });
    } finally {
      set({ inFlight: false });
    }
  },
}));
