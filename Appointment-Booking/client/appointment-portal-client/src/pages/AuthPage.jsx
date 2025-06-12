import React, { useState, useEffect } from 'react';
import { Container, Paper, Tabs, Tab, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';  // React Router hooks
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();  // To track the current URL path

  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 1 : 0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Change the URL based on the selected tab
    if (newValue === 0) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  useEffect(() => {
    // This will keep the tab in sync with the current URL
    if (location.pathname === '/register') {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [location]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          variant="fullWidth"
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 ? <LoginForm /> : <RegisterForm />}
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthPage;
