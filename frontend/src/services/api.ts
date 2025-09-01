import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true
});

export default api;