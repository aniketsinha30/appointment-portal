import axios from './axiosConfig';

export const getProviders = async (serviceId) => {
  const response = await axios.get('/users/providers', { params: { serviceId } });
  return response.data;
};

export const getProviderAvailability = async (providerId, date, timeZone) => {
  const response = await axios.get('/providers/availability', {
    params: { providerId, date, timeZone },
  });
  return response.data;
};

export const addOrUpdateAvailability = async (data) => {
  const response = await axios.post('/providers/availability', {...data});
  return response.data;
};

export const deleteAvailability = async (date) => {
  const response = await axios.delete(`/providers/availability/${date}`);
  return response.data;
};

export const updateProviderProfile = async (profileData) => {
  const response = await axios.put('/providers/profile', profileData);
  return response.data;
};

export const getProviderDashboard = async () => {
  const response = await axios.get('/providers/dashboard');
  return response.data;
};

export const getProviderServices = async () => {
  const response = await axios.get('/providers/services');
  return response.data;
};

export const updateProviderBookingStatus = async (bookingId, status) => {
  const response = await axios.put(`/providers/bookings/${bookingId}/status`, { status });
  return response.data;
};