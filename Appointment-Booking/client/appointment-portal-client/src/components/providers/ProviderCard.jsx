import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{provider.name}</Typography>
        <Typography variant="body2">{provider.about}</Typography>
        <Typography variant="body2">Experience: {provider.experience}</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate(`/providers/${provider._id}/availability`)}
        >
          View Availability
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;