import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { CheckCircle, HourglassEmpty } from '@mui/icons-material';
import { deleteBooking } from '../../api/bookings';
import { formatDate } from '../../utils/helpers';

const BookingList = ({ bookings, onBookingDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (bookingId) => {
    setDeletingId(bookingId);
    try {
      await deleteBooking(bookingId);
      onBookingDeleted(bookingId);
    } catch (error) {
      console.error('Error deleting booking:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <Typography variant="body1" sx={{ color: 'gray', mt: 2 }}>
        You don’t have any bookings.
      </Typography>
    );
  }

  return (
    <List>
      {bookings.map((booking) => (
        <ListItem
          key={booking._id}
          sx={{
            mb: 2,
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            padding: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e0f7fa',
              boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            },
          }}
          alignItems="flex-start"
          secondaryAction={
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDelete(booking._id)}
              disabled={deletingId === booking._id}
            >
              {deletingId === booking._id ? (
                <CircularProgress size={20} color="error" />
              ) : (
                'Cancel'
              )}
            </Button>
          }
        >
          <ListItemText
            primary={
              <Typography variant="body1" fontWeight="bold">
                {booking.service?.name || 'Service'} – {booking.provider?.name || 'Provider'}
              </Typography>
            }
            secondary={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'gray', mb: 0.5 }}>
                  {formatDate(booking.startTime, booking.timeZone)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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

                <Divider />
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default BookingList;
