import axios from "axios";
import { API_BASE_URL } from "./config.ts";
import { getAccessToken } from "../utils/AuthToken.ts";

export const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
