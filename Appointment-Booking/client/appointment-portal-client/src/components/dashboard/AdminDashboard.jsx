import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import {
  getAllUsers,
  approveProvider,
  declineProvider,
} from '../../api/users';
import { getServices, deleteService } from '../../api/services';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // to track current action
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, servicesData] = await Promise.all([
          getAllUsers(),
          getServices(),
        ]);
        setUsers(usersData);
        setServices(servicesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveProvider = async (providerId) => {
    setActionLoading(providerId);
    try {
      await approveProvider(providerId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === providerId ? { ...u, isApproved: true } : u
        )
      );
    } catch (err) {
      console.error('Error approving provider:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineProvider = async (providerId) => {
    setActionLoading(providerId);
    try {
      await declineProvider(providerId);
      setUsers((prev) => prev.filter((u) => u._id !== providerId));
    } catch (err) {
      console.error('Error declining provider:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (serviceId) => {
    setActionLoading(serviceId);
    try {
      await deleteService(serviceId);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
    } catch (err) {
      console.error('Error deleting service:', err);
    } finally {
      setActionLoading(null);
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
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Providers Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Providers Pending Approval
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {users.filter((u) => u.role === 'provider' && !u.isApproved).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pending providers.
            </Typography>
          ) : (
            users
              .filter((u) => u.role === 'provider' && !u.isApproved)
              .map((provider) => (
                <ListItem
                  key={provider._id}
                  sx={{
                    mb: 2,
                    borderRadius: 1,
                    backgroundColor: '#f9f9f9',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleApproveProvider(provider._id)}
                        disabled={actionLoading === provider._id}
                      >
                        {actionLoading === provider._id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDeclineProvider(provider._id)}
                        disabled={actionLoading === provider._id}
                      >
                        Decline
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={provider.name}
                    secondary={provider.email}
                  />
                </ListItem>
              ))
          )}
        </List>
      </Paper>

      {/* Services Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Services
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {services.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No services available.
            </Typography>
          ) : (
            services.map((service) => (
              <ListItem
                key={service._id}
                sx={{
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
                secondaryAction={
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteService(service._id)}
                    disabled={actionLoading === service._id}
                  >
                    {actionLoading === service._id ? (
                      <CircularProgress size={20} color="error" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                }
              >
                <ListItemText
                  primary={service.name}
                  secondary={service.description}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
