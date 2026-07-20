import { create } from "zustand";
import api from "../api/axios";
import { useAuthStore } from "./useAuthStore";

export const useDashboardStore = create((set, get) => ({
  data: null,
  status: "idle", // idle | loading | error
  error: null,
  lastLevelUp: null,

  fetchDashboard: async () => {
    set({ status: "loading", error: null });
    try {
      const { data } = await api.get("/dashboard");
      set({ data, status: "idle" });
    } catch (err) {
      set({
        status: "error",
        error: err.response?.data?.message || "Could not load your dashboard.",
      });
    }
  },

  toggleMission: async (missionId) => {
    const prev = get().data;
    if (!prev) return;

    // Optimistic update so the ring/checkmark responds instantly.
    const optimisticMissions = prev.missions.map((m) =>
      m._id === missionId
        ? { ...m, completed: !m.completed, progress: m.completed ? 0 : 100 }
        : m,
    );
    set({ data: { ...prev, missions: optimisticMissions } });

    try {
      const { data } = await api.patch(`/missions/${missionId}/toggle`);
      const { fetchDashboard } = get();
      if (data.user) useAuthStore.getState().setUser(data.user);
      if (data.leveledUp) set({ lastLevelUp: data.user.level });
      await fetchDashboard();
    } catch (err) {
      // Roll back on failure.
      set({
        data: prev,
        error: err.response?.data?.message || "Could not update that mission.",
      });
    }
  },

  clearLevelUp: () => set({ lastLevelUp: null }),

  updateMissionProgress: async (missionId, progress) => {
    const prev = get().data;
    if (!prev) return;

    const optimisticMissions = prev.missions.map((m) =>
      m._id === missionId ? { ...m, progress, completed: progress >= 100 } : m,
    );
    set({ data: { ...prev, missions: optimisticMissions } });

    try {
      const { data } = await api.patch(`/missions/${missionId}/progress`, {
        progress,
      });
      if (data.user) useAuthStore.getState().setUser(data.user);
      if (data.leveledUp) set({ lastLevelUp: data.user.level });
      await get().fetchDashboard();
    } catch (err) {
      set({
        data: prev,
        error: err.response?.data?.message || "Could not update progress.",
      });
    }
  },

  toggleTimelineEvent: async (eventId, currentStatus) => {
    const nextStatus = currentStatus === "done" ? "pending" : "done";
    const prev = get().data;
    if (!prev) return;

    const optimisticTimeline = prev.timeline.map((e) =>
      e._id === eventId ? { ...e, status: nextStatus } : e,
    );
    set({ data: { ...prev, timeline: optimisticTimeline } });

    try {
      await api.patch(`/timeline/${eventId}/status`, { status: nextStatus });
    } catch (err) {
      set({
        data: prev,
        error: err.response?.data?.message || "Could not update the timeline.",
      });
    }
  },

  createMission: async ({ type, title, subtitle }) => {
    try {
      await api.post("/missions", { type, title, subtitle, xpReward: 20 });
      await get().fetchDashboard();
      return { ok: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not add that mission.";
      set({ error: message });
      return { ok: false, message };
    }
  },
}));
