import axios from 'axios';
import { demoRequest } from './demoApi';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api-v1';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

let onUnauthorized = null;

export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

export function isJwtToken(token) {
  return typeof token === 'string' && token.split('.').length === 3;
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

function stripPath(url) {
  return url.replace(API_URL, '').replace(/^\//, '');
}

function getToken() {
  return api.defaults.headers.common.Authorization?.replace('Bearer ', '');
}

if (DEMO_MODE) {
  api.post = (url, data) => demoRequest('POST', stripPath(url), data, getToken());
  api.get = (url) => demoRequest('GET', stripPath(url), null, getToken());
  api.put = (url, data) => demoRequest('PUT', stripPath(url), data, getToken());
  api.delete = (url) => demoRequest('DELETE', stripPath(url), null, getToken());
} else {
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const msg =
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED' ? 'Request timed out' : null) ||
        (error.message === 'Network Error'
          ? 'Cannot reach server. Start backend: cd backend && npm run dev'
          : error.message);

      if (status === 401) {
        onUnauthorized?.();
      }

      return Promise.reject({
        ...error,
        response: error.response || { data: { message: msg } },
      });
    }
  );
}

export default api;
export const isDemoMode = DEMO_MODE;
