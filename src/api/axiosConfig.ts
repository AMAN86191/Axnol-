import axios from 'axios';
import { zustandStorage } from '../utils/asyncstorage';

const API_URL = 'https://gst.tambimotors.com/api/';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const authData = await zustandStorage.getItem('auth-storage');
    const token = authData?.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export default api;
