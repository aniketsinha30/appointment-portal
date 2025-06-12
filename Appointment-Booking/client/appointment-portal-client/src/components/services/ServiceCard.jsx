import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ServiceCard = ({ service }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{service.name}</Typography>
        <Typography variant="body2">{service.description}</Typography>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;