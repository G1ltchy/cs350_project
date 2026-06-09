import axios from "axios";
import { getAuthToken } from "../lib/authToken";

export const API_BASE_URL = "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
