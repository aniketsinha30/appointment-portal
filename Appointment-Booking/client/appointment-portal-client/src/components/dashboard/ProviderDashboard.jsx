import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { getProviderDashboard, updateProviderBookingStatus } from '../../api/providers';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState({ bookings: [], availability: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {user} = useAuth();
  console.log(user);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProviderDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateProviderBookingStatus(bookingId, status);
      setDashboardData((prevData) => ({
        ...prevData,
        bookings: prevData.bookings.map((b) =>
          b._id === bookingId ? { ...b, status } : b
        ),
      }));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* <Typography variant="h5" gutterBottom>
        Provider Dashboard
      </Typography> */}

      <Button
        variant="contained"
        onClick={() => navigate('/providers/availability')}
        sx={{ mb: 3,marginRight:5, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
      >
        Set Availability
      </Button>

      <Button
        variant="contained"
        onClick={() => navigate('/providers/profile/update')}
        sx={{ mb: 3, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
      >
        Update Profile
      </Button>

      <Typography variant="h6" gutterBottom>
        Upcoming Bookings
      </Typography>

      <List>
        {dashboardData.bookings.map((booking) => (
          <Paper
            key={booking._id}
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: '#f9f9f9',
              '&:hover': {
                backgroundColor: '#eef6f8',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <ListItem disableGutters>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="bold">
                    {booking.service.name}
                  </Typography>
                }
                secondary={
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(booking.startTime, booking.timeZone)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {booking.status === 'confirmed' && (
                          <>
                            <CheckCircle sx={{ color: 'green', mr: 1 }} />
                            <Typography variant="body2" color="green">
                              Confirmed
                            </Typography>
                          </>
                        )}
                        {booking.status === 'pending' && (
                          <>
                            <HourglassEmpty sx={{ color: 'orange', mr: 1 }} />
                            <Typography variant="body2" color="orange">
                              Pending
                            </Typography>
                          </>
                        )}
                        {booking.status === 'declined' && (
                          <>
                            <Cancel sx={{ color: 'red', mr: 1 }} />
                            <Typography variant="body2" color="red">
                              Declined
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </>
                }
              />
            </ListItem>

            {booking.status === 'pending' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                  variant="contained"
                  sx={{ mr: 1 }}
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(booking._id, 'declined')}
                  variant="outlined"
                  color="error"
                >
                  Decline
                </Button>
              </Box>
            )}
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default ProviderDashboard;
