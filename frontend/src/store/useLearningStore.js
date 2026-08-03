import { create } from "zustand";
import api from "../api/axios";

export const useLearningStore = create((set) => ({
  questions: [],
  progress: null,
  status: "idle",
  error: null,

  fetchLearning: async () => {
    set({ status: "loading", error: null });

    try {
      const { data } = await api.get("/learning/questions");

      set({
        questions: Array.isArray(data) ? data : [],
        progress: {
          completed: Array.isArray(data)
            ? data.filter((question) => question.completed).length
            : 0,
          total: Array.isArray(data) ? data.length : 0,
        },
        status: "success",
        error: null,
      });
    } catch (err) {
      set({
        status: "error",
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to load learning roadmap.",
      });
    }
  },
}));
