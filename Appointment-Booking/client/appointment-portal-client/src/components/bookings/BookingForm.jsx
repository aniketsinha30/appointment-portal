// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { getServices } from '../../api/services';
import { getProvidersById } from '../../api/users';
import { createBooking } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';

const BookingForm = ({ onCancel, onSuccess }) => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await getServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleServiceChange = async (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    setSelectedProvider('');
    setSelectedDate('');
    setSelectedSlot('');
    try {
      const providersData = await getProvidersById(serviceId);
      setProviders(providersData);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProvider || !selectedDate || !selectedSlot) {
      setError('Please select provider, date, and time slot.');
      return;
    }

    setLoading(true); // Start loading
    try {
      const start = new Date(selectedSlot.startTime);
      const end = new Date(selectedSlot.endTime);

      const bookingData = {
        providerId: selectedProvider,
        serviceId: selectedService,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };

      const newBooking = await createBooking(bookingData);
      onSuccess(newBooking);
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        select
        label="Service"
        fullWidth
        margin="normal"
        value={selectedService}
        onChange={handleServiceChange}
        required
        disabled={loading}
      >
        {services.map((service) => (
          <MenuItem key={service._id} value={service._id}>
            <Tooltip title={service.description} arrow placement="right">
              <span>{service.name}</span>
            </Tooltip>
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Provider"
        fullWidth
        margin="normal"
        value={selectedProvider}
        onChange={(e) => {
          setSelectedProvider(e.target.value);
          setSelectedDate('');
          setSelectedSlot('');
        }}
        disabled={providers.length === 0 || loading}
        required
      >
        {providers.map((provider) => (
          <MenuItem key={provider._id} value={provider._id}>
            {provider.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Date"
        fullWidth
        margin="normal"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedSlot('');
        }}
        disabled={!selectedProvider || loading}
        required
      >
        {(providers.find(p => p._id === selectedProvider)?.availability || []).map((avail) => (
          <MenuItem key={avail.date} value={avail.date}>
            {avail.date}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Time Slot"
        fullWidth
        margin="normal"
        value={selectedSlot ? JSON.stringify(selectedSlot) : ''}
        onChange={(e) => setSelectedSlot(JSON.parse(e.target.value))}
        disabled={!selectedDate || loading}
        required
      >
        {(providers.find(p => p._id === selectedProvider)
          ?.availability.find(a => a.date === selectedDate)?.slots || []).map((slot, index) => (
          <MenuItem key={index} value={JSON.stringify(slot)}>
            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </MenuItem>
        ))}
      </TextField>

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </Button>

        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ ml: 2 }}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default BookingForm;
