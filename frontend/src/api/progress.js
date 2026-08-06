import { API_BASE_URL } from "./axios";

export const getProgress = async () => {
  const token = localStorage.getItem("ascend_token");
  const response = await fetch(`${API_BASE_URL}/progress`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to load progress.");
  }

  return response.json();
};