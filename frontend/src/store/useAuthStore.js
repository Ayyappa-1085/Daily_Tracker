  import { create } from "zustand";
  import api from "../api/axios";

  function loadStoredUser() {
    try {
      const raw = localStorage.getItem("ascend_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  export const useAuthStore = create((set, get) => ({
    user: loadStoredUser(),
    token: localStorage.getItem("ascend_token") || null,
    status: "idle", // idle | loading | error
    error: null,

    isAuthenticated: () => !!get().token,

    setUser: (user) => {
      localStorage.setItem("ascend_user", JSON.stringify(user));
      set({ user });
    },

    login: async (email, password) => {
      set({ status: "loading", error: null });
      try {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("ascend_token", data.token);
        localStorage.setItem("ascend_user", JSON.stringify(data.user));
        set({ token: data.token, user: data.user, status: "idle" });
        return { ok: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Unable to sign in. Please try again.";
        set({ status: "error", error: message });
        return { ok: false, message };
      }
    },

    register: async (name, email, password) => {
      set({ status: "loading", error: null });
      try {
        const { data } = await api.post("/auth/register", {
          name,
          email,
          password,
        });
        localStorage.setItem("ascend_token", data.token);
        localStorage.setItem("ascend_user", JSON.stringify(data.user));
        set({ token: data.token, user: data.user, status: "idle" });
        return { ok: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Unable to create your account.";
        set({ status: "error", error: message });
        return { ok: false, message };
      }
    },

    logout: () => {
      localStorage.removeItem("ascend_token");
      localStorage.removeItem("ascend_user");
      localStorage.removeItem("ascend_dashboard");
      localStorage.removeItem("ascend_learning");
      localStorage.removeItem("ascend_progress");
      set({ token: null, user: null });
    },
  }));
