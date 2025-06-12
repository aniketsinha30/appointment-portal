import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, List, ListItem, ListItemText, Paper, IconButton, Divider } from '@mui/material';
import { getUserDashboard } from '../../api/users';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { CheckCircle, HourglassEmpty } from '@mui/icons-material'; // Icons for confirmed and pending statuses
import Loader from '../ui/Loader';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserDashboard();
        setBookings(data.bookings);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader/>;

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => navigate('/bookings')}
        sx={{
          mb: 4,
          backgroundColor: '#1976d2',
          '&:hover': { backgroundColor: '#1565c0' },
        }}
      >
        Book & Edit Appointment
      </Button>

      <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          My Bookings
        </Typography>

        <List>
          {bookings.length === 0 ? (
            <Typography variant="body1" sx={{ color: 'gray' }}>
              You don't have any bookings yet.
            </Typography>
          ) : (
            bookings.map((booking) => (
              <ListItem
                key={booking._id}
                sx={{
                  mb: 2,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 1,
                  padding: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#e0f7fa', // Hover background color
                    cursor: 'pointer',
                    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', // Adding subtle shadow on hover
                  },
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {booking.service.name} - {booking.provider.name}
                      </Typography>
                    </>
                  }
                  secondary={
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'gray' }}>
                          {formatDate(booking.startTime, booking.timeZone)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {booking.status === 'confirmed' ? (
                            <>
                              <CheckCircle sx={{ color: 'green', mr: 1 }} />
                              <Typography variant="body2" sx={{ color: 'green' }}>
                                Confirmed
                              </Typography>
                            </>
                          ) : (
                            <>
                              <HourglassEmpty sx={{ color: 'orange', mr: 1 }} />
                              <Typography variant="body2" sx={{ color: 'orange' }}>
                                Pending
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default UserDashboard;
