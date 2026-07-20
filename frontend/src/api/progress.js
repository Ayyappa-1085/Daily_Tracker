import api from "./axios";

export const getProgress = async () => {
  const { data } = await api.get("/progress");
  return data;
};