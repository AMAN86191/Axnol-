import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://192.168.0.8:8000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// export const authAPI = {
//   login: (credentials: { email?: string; password?: string; phone?: string }) => 
//     api.post('/login', credentials),
  
//   register: (data: any) => 
//     api.post('/register', data),

//   sendOtp: (data: { email: string }) => 
//     api.post('/send-otp', data),

//   verifyOtp: (data: { email: string; otp: string }) => 
//     api.post('/verify-otp', data),

//   verifyOtpOnly: (data: { otp: string }) => 
//     api.post('/verify-otp-only', data),

//   checkUser: (data: { email: string }) => 
//     api.post('/check-user', data),

//   uploadDocument: (data: FormData) => 
//     api.post('/upload-document', data, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     }),

//   logout: () => 
//     api.post('/logout'),

//   getUser: () => 
//     api.get('/user'),

//   updateProfile: (data: any) => 
//     api.post('/update-profile', data),
// };

// export const jobAPI = {
//   getJobs: (params?: { search?: string; job_type?: string }) => 
//     api.get('/jobs', { params }),

//   postJob: (data: any) => 
//     api.post('/jobs', data),

//   getMyJobs: () => 
//     api.get('/jobs/my'),

//   getJobDetails: (id: number | string) => 
//     api.get(`/jobs/${id}`),
// };

export default api;
