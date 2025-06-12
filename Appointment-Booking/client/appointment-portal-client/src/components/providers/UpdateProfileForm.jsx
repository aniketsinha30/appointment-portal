import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  CircularProgress,
  Checkbox,
  ListItemText,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getProviderServices, updateProviderProfile } from '../../api/providers';

const UpdateProfileForm = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    experience: '',
    services: [],
  });

  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initForm = async () => {
      try {
        const servicesData = await getProviderServices();
        setAllServices(servicesData);
        setFormData({
          name: user.name || '',
          about: user.about || '',
          experience: user.experience || '',
          services: user.services || [],
        });
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      services: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProviderProfile(formData);
      if (setUser) {
        setUser((prev) => ({ ...prev, ...formData }));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setSaving(false);
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
    <Card sx={{ maxWidth: 700, mx: 'auto', mt: 5 }}>
      <CardHeader title="Update Profile" sx={{ textAlign: 'center' }} />
      <Divider />
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            <TextField
              label="About"
              name="about"
              multiline
              rows={3}
              value={formData.about}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            <TextField
              label="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              fullWidth
              disabled={saving}
            />

            <FormControl fullWidth>
              <InputLabel id="services-label">Services</InputLabel>
              <Select
                labelId="services-label"
                multiple
                value={formData.services}
                onChange={handleServiceChange}
                input={<OutlinedInput label="Services" />}
                renderValue={(selected) =>
                  allServices
                    .filter((service) => selected.includes(service._id))
                    .map((service) => service.name)
                    .join(', ')
                }
                disabled={saving}
              >
                {allServices.map((service) => (
                  <MenuItem key={service._id} value={service._id}>
                    <Checkbox checked={formData.services.includes(service._id)} />
                    <ListItemText primary={service.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ minWidth: 150 }}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UpdateProfileForm;
