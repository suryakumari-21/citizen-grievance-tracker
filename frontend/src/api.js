// frontend/src/api.js
// redeploy test

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL + '/api'
    : 'http://localhost:5000/api'
});

// attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

