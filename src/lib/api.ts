import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // still send cookies when they DO work (desktop)
});

// Fallback: also attach the token as a header on every request,
// read from localStorage. Needed because some mobile browsers
// won't reliably send cross-domain cookies (sameSite: "none" issues).
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;