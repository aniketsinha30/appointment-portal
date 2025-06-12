import axios from './axiosConfig';

export const getUserProfile = async () => {
  const response = await axios.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.put('/users/profile', profileData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get('/admin/users');
  return response.data;
};

export const getUserDashboard = async () => {
  const response = await axios.get('/users/dashboard');
  return response.data;
};

export const approveProvider = async (providerId) => {
  const response = await axios.put(`/admin/providers/${providerId}/approve`);
  return response.data;
};

export const declineProvider = async (providerId) => {
  const response = await axios.delete(`/admin/providers/${providerId}/decline`);
  return response.data;
};

export const getProvidersById = async (serviceId) => {
  const response = await axios.get(`/users/providers`, {
    params: { serviceId }
  });
  return response.data;
};
