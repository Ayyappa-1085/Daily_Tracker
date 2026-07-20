import { create } from "zustand";
import { getProgress } from "../api/progress";

export const useProgressStore = create((set) => ({
  user: null,
  weekly: [],
  monthly: [],
  stats: null,

  loading: false,
  error: null,

  fetchProgress: async () => {
    set({
      loading: true,
      error: null,
    });

    try {
      const data = await getProgress();

      set({
        user: data.user,
        weekly: data.weekly,
        monthly: data.monthly,
        stats: data.stats,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error:
          err.response?.data?.message ||
          "Failed to load progress.",
      });
    }
  },
}));