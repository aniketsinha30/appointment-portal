import axios from './axiosConfig';

export const getServices = async () => {
  const response = await axios.get('/services');
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await axios.post('/admin/services', serviceData);
  return response.data;
};

export const updateService = async (serviceId, serviceData) => {
  const response = await axios.put(`/admin/services/${serviceId}`, serviceData);
  return response.data;
};

export const deleteService = async (serviceId) => {
  const response = await axios.delete(`/admin/services/${serviceId}`);
  return response.data;
};