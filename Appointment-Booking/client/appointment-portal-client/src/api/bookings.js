// api/bookings.js
import axios from './axiosConfig';

export const createBooking = async (bookingData) => {
  const response = await axios.post('/users/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async () => {
  const response = await axios.get('/users/bookings');
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await axios.put(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

export const deleteBooking = async (bookingId) => {
  const response = await axios.delete(`/bookings/${bookingId}`);
  return response.data;
};