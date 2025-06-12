import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const menuItems = {
    user: [
      { text: 'Dashboard', path: '/dashboard' },
      { text: 'Bookings', path: '/bookings' },
      { text: 'Providers', path: '/providers' },
      { text: 'Services', path: '/services' },
    ],
    provider: [
      { text: 'Dashboard', path: '/dashboard' },
      { text: 'Set Availability', path: '/providers/availability' },
    ],
    admin: [
      { text: 'Dashboard', path: '/dashboard' },
      { text: 'Manage Users', path: '/admin/users' },
      { text: 'Manage Services', path: '/services' },
    ],
  };

  const items = menuItems[user?.role] || [];

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <List sx={{ width: 250 }}>
        {items.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path} onClick={onClose}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;