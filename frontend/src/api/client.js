import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' }
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('shr-token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('shr-token');
  }
};

export default api;
