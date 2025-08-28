// src/components/Header.jsx - Global navbar for regular pages
import {
  Group,
  Button,
  Text,
  Container,
  Paper,
  Menu,
  Avatar,
  Divider
} from '@mantine/core';
import {
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconUser,
  IconMapPin,
  IconPlus,
  IconUsers,
  IconSearch,
  IconSettings
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Paper shadow="sm" withBorder mb="md">
      <Container size="xl" py="sm">
        <Group justify="space-between">
          {/* Left side - Logo/Brand */}
           <div>
              <Text 
                size="xl" 
                fw={800} 
                className="
                  cursor-pointer
                  bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
                  hover:from-blue-700 hover:to-purple-700
                  transition-all duration-300 ease-out
                "
                onClick={() => navigate('/')}
              >
                AccessAble
              </Text>
            </div>

          {/* Right side - Nav items */}
          {!isAuthenticated && (
            <Group gap="sm">
              {/* Sign Up button */}
              <Button
                variant={location.pathname === '/register' ? 'filled' : 'outline'}
                color="blue"
                leftSection={<IconUserPlus size={16} />}
                onClick={() => navigate('/register')}
                radius="md"
              >
                Sign Up
              </Button>

              {/* Login button */}
              <Button
                variant='filled'
                color="blue"
                leftSection={<IconLogin size={16} />}
                onClick={() => navigate('/login')}
                radius="md"
              >
                Login
              </Button>
            </Group>
          )}
          {isAuthenticated && (
            <Group gap="sm">
              {/* Navigation buttons */}
              <Button
                variant="outline"
                color="blue"
                leftSection={<IconMapPin size={16} />}
                onClick={() => navigate('/show-places')}
                radius="md"
              >
                Explore Places
              </Button>

              <Button
                variant="outline"
                color="green"
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate('/add-place')}
                radius="md"
              >
                Add Place
              </Button>

              {/* Role-specific buttons */}
              {user?.role?.toLowerCase() === 'caregiver' && (
                <Button
                  variant="outline"
                  color="purple"
                  leftSection={<IconUsers size={16} />}
                  onClick={() => navigate('/find-disabled')}
                  radius="md"
                >
                  Find Disabled
                </Button>
              )}

              {user?.role?.toLowerCase() === 'pwd' && (
                <Button
                  variant="outline"
                  color="purple"
                  leftSection={<IconUsers size={16} />}
                  onClick={() => navigate('/find-care')}
                  radius="md"
                >
                  Find Caregiver
                </Button>
              )}

              {user?.role?.toLowerCase() === 'admin' && (
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconSettings size={16} />}
                  onClick={() => navigate('/admin')}
                  radius="md"
                >
                  Admin Panel
                </Button>
              )}

              {/* User menu */}
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle" radius="md">
                    <Avatar 
                      src={user?.profilePicture} 
                      size="sm" 
                      radius="xl" 
                      color="blue"
                    >
                      {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={() => navigate('/profile')}
                  >
                    My Profile
                  </Menu.Item>
                  
                  <Divider />
                  
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
        </Group>
      </Container>
    </Paper>
  );
}

export default MainHeader;
