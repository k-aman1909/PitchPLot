import api from './api';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('slidesense_token', response.data.token);
  }
  return response.data;
};

export const sendSignupOTP = async (email) => {
  const response = await api.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOTPAndRegister = async ({ name, email, password, otp }) => {
  const response = await api.post('/auth/verify-otp-register', { name, email, password, otp });
  if (response.data.token) {
    localStorage.setItem('slidesense_token', response.data.token);
  }
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  if (response.data.token) {
    localStorage.setItem('slidesense_token', response.data.token);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('slidesense_token');
};
