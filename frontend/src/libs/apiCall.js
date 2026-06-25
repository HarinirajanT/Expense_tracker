import axios from 'axios';
import { toast } from 'sonner';
import { demoRequest } from './demoApi';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api-v1';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

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

function wrapDemo(method, url, data) {
  return demoRequest(method, stripPath(url), data, getToken()).catch((err) => {
    throw err;
  });
}

if (DEMO_MODE) {
  api.post = (url, data) => wrapDemo('POST', url, data);
  api.get = (url) => wrapDemo('GET', url, null);
  api.put = (url, data) => wrapDemo('PUT', url, data);
  api.delete = (url) => wrapDemo('DELETE', url, null);
} else {
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const msg =
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED' ? 'Request timed out' : null) ||
        (error.message === 'Network Error'
          ? 'Cannot reach server. Is the backend running on port 8000?'
          : error.message);
      if (msg && !error.config?.silent) {
        console.error('[API]', msg);
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
