import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import ServiceCard from '../components/services/ServiceCard';
import { getServices } from '../api/services';
import Loader from '../components/ui/Loader';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <Loader />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Available Services
      </Typography>
      <Box>
        {services.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </Box>
    </Container>
  );
};

export default ServicesPage;