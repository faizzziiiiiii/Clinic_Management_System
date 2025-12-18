// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach token automatically to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto handle expired tokens (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login"; // Force logout
    }
    return Promise.reject(error);
  }
);

export default API;
