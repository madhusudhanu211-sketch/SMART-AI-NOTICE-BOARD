import axios from 'axios';
import { API_CONFIG } from './config';

// Fallback in-memory token store if SecureStore isn't native
let userToken = null;

export const setAuthToken = (token) => {
  userToken = token;
};

export const getAuthToken = () => userToken;

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Dynamic Base URL check in case host changed
    config.baseURL = API_CONFIG.BASE_URL;
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[API Client Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
