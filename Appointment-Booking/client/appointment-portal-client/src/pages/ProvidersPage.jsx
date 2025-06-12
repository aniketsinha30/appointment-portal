import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import ProviderCard from '../components/providers/ProviderCard';
import { getProviders } from '../api/providers';
import Loader from '../components/ui/Loader';

const ProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await getProviders();
        setProviders(data);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  if (loading) return <Loader />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Available Providers
      </Typography>
      <Box>
        {providers.map((provider) => (
          <ProviderCard key={provider._id} provider={provider} />
        ))}
      </Box>
    </Container>
  );
};

export default ProvidersPage;