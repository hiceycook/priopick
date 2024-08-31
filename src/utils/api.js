import axios from 'axios';
import { getAuthToken } from './authUtils';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Make sure this matches your backend URL
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getUser = () => api.get('/user');
export const getCollections = () => api.get('/collections');
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);
export const addRanker = (collectionId, email) => api.post(`/collections/${collectionId}/rankers`, { email });

export const getRankerCollection = (accessCode) => api.get(`/rankers/${accessCode}`);
export const submitRankings = (accessCode, rankings) => api.post(`/rankers/${accessCode}/submit`, { rankings });

export default api;
