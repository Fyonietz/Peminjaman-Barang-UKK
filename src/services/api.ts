// src/services/api.ts
import axios from 'axios';

// Uses the environment variable if available, otherwise defaults to local
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5162/api/v1'
});

http.interceptors.request.use((config) => {
  // Matches the 'campgear' localStorage key convention from the API guide
  const sessionData = localStorage.getItem('campgear');
  if (sessionData) {
    const parsedData = JSON.parse(sessionData);
    if (parsedData?.token) {
      config.headers.Authorization = `Bearer ${parsedData.token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatically intercept 401 Unauthorized responses to clear session and kick to login
    if (error.response?.status === 401) {
      localStorage.removeItem('campgear');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
