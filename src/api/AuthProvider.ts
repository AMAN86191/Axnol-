import api from './axiosConfig';

export const registerUser = async (payload: any) => {
  try {
    const response = await api.post('/register', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const loginUser = async (payload: any) => {
  try {
    const response = await api.post('/login', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const verifyOtp = async (payload: any) => {
  try {
    const response = await api.post('/otp/verify', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const resendOtp = async (payload: any) => {
  try {
    const response = await api.post('/otp/resend', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const updateProfile = async (payload: any) => {
  try {
    const isFormData = payload instanceof FormData;
    const response = await api.put('/profile', payload, {
      headers: isFormData
        ? {'Content-Type': 'multipart/form-data'}
        : {'Content-Type': 'application/json'},
    });
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const changePassword = async (payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) => {
  try {
    const response = await api.post('/password/change', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
