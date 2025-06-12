import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { addOrUpdateAvailability } from '../../api/providers';
import { useAuth } from '../../context/AuthContext';

const AvailabilityForm = ({ onSuccess }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Uncomment to get provider timezone

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!date || !startTime || !endTime) {
      setError('All fields are required');
      return;
    }
    
    try {
      // Create payload with raw date/time strings
      const availabilityData = {
        date,
        startTime,
        endTime,
        duration,
        // Backend will combine with provider timezone
      };
      
      await addOrUpdateAvailability(availabilityData);
      onSuccess();
      setDate('');
      setStartTime('');
      setEndTime('');
      setDuration(30);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set availability');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 600,
        margin: 'auto',
        mt: 5,
        p: 4,
        borderRadius: 2,
        backgroundColor: '#fdfdfd',
      }}
    >
      <Typography variant="h6" gutterBottom textAlign="center">
        Set Your Availability
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          margin="normal"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              margin="normal"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Time"
              type="time"
              fullWidth
              margin="normal"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <TextField
          label="Slot Duration (minutes)"
          type="number"
          fullWidth
          margin="normal"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
          inputProps={{ min: 15, max: 120 }}
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.2 }}
        >
          Save Availability
        </Button>
      </Box>
    </Paper>
  );
};

export default AvailabilityForm;