// src/components/AdminHeader.jsx
import { Container, Group, Paper, Text, ActionIcon, Button } from '@mantine/core';
import { IconRefresh, IconLogout, IconUsers, IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminHeader({ onRefresh, isRefreshing }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Pending Users', path: '/admin', icon: <IconUsers size={16} /> },
    { label: 'Pending Places', path: '/admin/places', icon: <IconMapPin size={16} /> },
    { label: 'Pending Reviews', path: '/admin/reviews', icon: <IconMessageCircle size={16} /> },
    { label: 'All Users', path: '/admin/all-users', icon: <IconUsers size={16} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Paper
      shadow="sm"
      withBorder
      styles={{
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          color: '#2C3E50'
        }
      }}
    >
      <Container size="xl" py="sm">
        <Group justify="space-between">
          {/* Left side - Logo */}
          <Text
            size="xl"
            fw={700}
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            AccessAble
          </Text>

          {/* Center - Navigation (match regular navbar style) */}
          <Group gap="xs">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Button
                  key={link.path}
                  variant={isActive ? 'filled' : 'subtle'}
                  leftSection={link.icon}
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </Button>
              );
            })}
          </Group>


          {/* Right side - Refresh + Logout */}
          <Group gap="sm">
            {onRefresh && (
              <ActionIcon
                variant="outline"
                onClick={onRefresh}
                loading={isRefreshing}
                size="lg"
                aria-label="Refresh"
                title="Refresh"
                styles={{
                  root: {
                    borderColor: '#4A5568',
                    color: '#2C3E50',
                    backgroundColor: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: '#F7FAFC',
                      borderColor: '#2C3E50'
                    }
                  }
                }}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            )}

            <Button
              variant="outline"
              color="red"
              leftSection={<IconLogout size={14} />}
              onClick={handleLogout}
              styles={{
                root: {
                  borderColor: '#E53E3E',
                  backgroundColor: '#FFFFFF',
                  color: '#E53E3E',
                  '&:hover': { backgroundColor: '#E53E3E', color: 'white' }
                }
              }}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}

export default AdminHeader;
