// pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
import BookingList from '../components/bookings/BookingList';
import BookingForm from '../components/bookings/BookingForm';
import { getUserBookings } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleNewBooking = () => {
    setShowForm(true);
  };

  const handleBookingCreated = async () => {
    await fetchBookings(); // Refresh list after new booking
    setShowForm(false);
  };

  const handleBookingDeleted = (deletedId) => {
    setBookings((prev) => prev.filter((b) => b._id !== deletedId));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        {user.name}'s Appointments
      </Typography>

      {showForm ? (
        <BookingForm onCancel={() => setShowForm(false)} onSuccess={handleBookingCreated} />
      ) : (
        <Button variant="contained" onClick={handleNewBooking} sx={{ mb: 3 }}>
          Book New Appointment
        </Button>
      )}

      {loading ? (
        // <div>Loading bookings...</div>
        <Loader/>
      ) : (
        <BookingList bookings={bookings} onBookingDeleted={handleBookingDeleted} />
      )}
    </Container>
  );
};

export default BookingsPage;
