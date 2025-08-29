import {
  Group,
  Button,
  Text,
  Container,
  Paper,
  Menu,
  Avatar,
  Divider,
  Burger,
  Collapse,
  Stack,
  ActionIcon
} from '@mantine/core';
import {
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconUser,
  IconMapPin,
  IconPlus,
  IconUsers,
  IconSettings
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';

function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpened(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpened(false);
  };

  const isActive = (path) => location.pathname === path;

  const MobileNavButton = ({ icon, label, path, variant = 'light' }) => (
    <Button
      variant={isActive(path) ? 'filled' : variant}
      leftSection={icon}
      onClick={() => handleNavigate(path)}
      radius="xl"
      fullWidth
      justify="start"
      style={{
        color: isActive(path) ? '#8b45c3' : '#ffffff',
        backgroundColor: isActive(path) ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        marginBottom: '8px'
      }}
    >
      {label}
    </Button>
  );

  return (
    <Paper 
      shadow="lg" 
      withBorder={false}
      mb="md"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 69, 195, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000
      }}
    >
      <Container size="xl" py={isMobile ? "sm" : "md"}>
        <Group justify="space-between" align="center">
          {/* Left side - Logo/Brand */}
          <div>
            <Text 
              size={isMobile ? "lg" : "xl"}
              fw={800} 
              style={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                fontSize: isMobile ? '1.2rem' : '1.5rem',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.filter = 'brightness(1)';
              }}
              onClick={() => handleNavigate('/')}
            >
              AccessAble
            </Text>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Group gap={isTablet ? "xs" : "sm"} style={{ marginLeft: 'auto', marginRight: '20px' }}>
              {!isAuthenticated && (
                <Group gap="sm">
                  {/* Sign Up button */}
                  <Button
                    variant={isActive('/register') ? 'filled' : 'light'}
                    color="white"
                    leftSection={<IconUserPlus size={16} />}
                    onClick={() => navigate('/register')}
                    radius="xl"
                    size={isTablet ? "sm" : "md"}
                    style={{
                      color: isActive('/register') ? '#8b45c3' : '#ffffff',
                      backgroundColor: isActive('/register') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      transform: isActive('/register') ? 'scale(1.02)' : 'none',
                      boxShadow: isActive('/register') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                        }
                      }
                    }}
                  >
                    {isTablet ? 'Sign Up' : 'Sign Up'}
                  </Button>

                  {/* Login button */}
                  <Button
                    variant={isActive('/login') ? 'filled' : 'light'}
                    leftSection={<IconLogin size={16} />}
                    onClick={() => navigate('/login')}
                    radius="xl"
                    size={isTablet ? "sm" : "md"}
                    style={{
                      backgroundColor: isActive('/login') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      color: isActive('/login') ? '#8b45c3' : '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      transform: isActive('/login') ? 'scale(1.02)' : 'none',
                      boxShadow: isActive('/login') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                        }
                      }
                    }}
                  >
                    Login
                  </Button>
                </Group>
              )}
              {isAuthenticated && (
                <Group gap={isTablet ? "xs" : "sm"}>
                  {/* Navigation buttons */}
                  <Button
                    variant={isActive('/show-places') ? 'filled' : 'light'}
                    color="white"
                    leftSection={<IconMapPin size={16} />}
                    onClick={() => navigate('/show-places')}
                    radius="xl"
                    size="sm"
                    style={{
                      color: isActive('/show-places') ? '#8b45c3' : '#ffffff',
                      backgroundColor: isActive('/show-places') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      transform: isActive('/show-places') ? 'scale(1.02)' : 'none',
                      boxShadow: isActive('/show-places') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                        }
                      }
                    }}
                  >
                    {isTablet ? 'Explore' : 'Explore Places'}
                  </Button>

                  <Button
                    variant={isActive('/add-place') ? 'filled' : 'light'}
                    color="white"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate('/add-place')}
                    radius="xl"
                    size="sm"
                    style={{
                      color: isActive('/add-place') ? '#8b45c3' : '#ffffff',
                      backgroundColor: isActive('/add-place') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      transform: isActive('/add-place') ? 'scale(1.02)' : 'none',
                      boxShadow: isActive('/add-place') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                        }
                      }
                    }}
                  >
                    {isTablet ? 'Add' : 'Add Place'}
                  </Button>

                  {/* Role-specific buttons - Hidden on small tablets */}
                  {!isTablet && user?.role?.toLowerCase() === 'caregiver' && (
                    <Button
                      variant={isActive('/find-disabled') ? 'filled' : 'light'}
                      color="white"
                      leftSection={<IconUsers size={16} />}
                      onClick={() => navigate('/find-disabled')}
                      radius="xl"
                      size="sm"
                      style={{
                        color: isActive('/find-disabled') ? '#8b45c3' : '#ffffff',
                        backgroundColor: isActive('/find-disabled') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        transform: isActive('/find-disabled') ? 'scale(1.02)' : 'none',
                        boxShadow: isActive('/find-disabled') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                      }}
                      styles={{
                        root: {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                          }
                        }
                      }}
                    >
                      Find Disabled
                    </Button>
                  )}

                  {!isTablet && user?.role?.toLowerCase() === 'pwd' && (
                    <Button
                      variant={isActive('/find-care') ? 'filled' : 'light'}
                      color="white"
                      leftSection={<IconUsers size={16} />}
                      onClick={() => navigate('/find-care')}
                      radius="xl"
                      size="sm"
                      style={{
                        color: isActive('/find-care') ? '#8b45c3' : '#ffffff',
                        backgroundColor: isActive('/find-care') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        transform: isActive('/find-care') ? 'scale(1.02)' : 'none',
                        boxShadow: isActive('/find-care') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                      }}
                      styles={{
                        root: {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                          }
                        }
                      }}
                    >
                      Find Caregiver
                    </Button>
                  )}

                  {!isTablet && user?.role?.toLowerCase() === 'admin' && (
                    <Button
                      variant={isActive('/admin') ? 'filled' : 'light'}
                      color="white"
                      leftSection={<IconSettings size={16} />}
                      onClick={() => navigate('/admin')}
                      radius="xl"
                      size="sm"
                      style={{
                        color: isActive('/admin') ? '#8b45c3' : '#ffffff',
                        backgroundColor: isActive('/admin') ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        transform: isActive('/admin') ? 'scale(1.02)' : 'none',
                        boxShadow: isActive('/admin') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                      }}
                      styles={{
                        root: {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                          }
                        }
                      }}
                    >
                      Admin Panel
                    </Button>
                  )}

                  {/* User menu */}
                  <Menu shadow="lg" width={220} position="bottom-end" zIndex={1100}>
                    <Menu.Target>
                      <Button 
                        variant="light" 
                        radius="xl"
                        p="xs"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                        styles={{
                          root: {
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.25)',
                              transform: 'translateY(-2px) scale(1.02)',
                              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                            }
                          }
                        }}
                      >
                        <Avatar 
                          src={user?.profilePicture} 
                          size="sm" 
                          radius="xl" 
                          style={{
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            backgroundColor: '#ffffff',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                      </Button>
                    </Menu.Target>

                    <Menu.Dropdown
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px'
                      }}
                    >
                      <Menu.Label style={{ color: '#6b7280', fontWeight: 600 }}>
                        {user?.username || user?.email || 'Account'}
                      </Menu.Label>
                      <Menu.Item
                        leftSection={<IconUser size={14} />}
                        onClick={() => navigate('/profile')}
                        style={{
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          backgroundColor: isActive('/profile') ? 'rgba(139, 69, 195, 0.1)' : 'transparent',
                          color: isActive('/profile') ? '#8b45c3' : '#6b7280'
                        }}
                      >
                        My Profile
                      </Menu.Item>
                      
                      {/* Role-specific menu items for tablet */}
                      {isTablet && user?.role?.toLowerCase() === 'caregiver' && (
                        <Menu.Item
                          leftSection={<IconUsers size={14} />}
                          onClick={() => navigate('/find-disabled')}
                          style={{
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            backgroundColor: isActive('/find-disabled') ? 'rgba(139, 69, 195, 0.1)' : 'transparent',
                            color: isActive('/find-disabled') ? '#8b45c3' : '#6b7280'
                          }}
                        >
                          Find Disabled
                        </Menu.Item>
                      )}

                      {isTablet && user?.role?.toLowerCase() === 'pwd' && (
                        <Menu.Item
                          leftSection={<IconUsers size={14} />}
                          onClick={() => navigate('/find-care')}
                          style={{
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            backgroundColor: isActive('/find-care') ? 'rgba(139, 69, 195, 0.1)' : 'transparent',
                            color: isActive('/find-care') ? '#8b45c3' : '#6b7280'
                          }}
                        >
                          Find Caregiver
                        </Menu.Item>
                      )}

                      {isTablet && user?.role?.toLowerCase() === 'admin' && (
                        <Menu.Item
                          leftSection={<IconSettings size={14} />}
                          onClick={() => navigate('/admin')}
                          style={{
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            backgroundColor: isActive('/admin') ? 'rgba(139, 69, 195, 0.1)' : 'transparent',
                            color: isActive('/admin') ? '#8b45c3' : '#6b7280'
                          }}
                        >
                          Admin Panel
                        </Menu.Item>
                      )}
                      
                      <Divider />
                      
                      <Menu.Item
                        leftSection={<IconLogout size={14} />}
                        color="red"
                        onClick={handleLogout}
                        style={{
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Logout
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              )}
            </Group>
          )}

          {/* Mobile Menu Burger */}
          {isMobile && (
            <Group gap="sm">
              {isAuthenticated && (
                <ActionIcon
                  variant="light"
                  size="lg"
                  radius="xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onClick={() => navigate('/profile')}
                >
                  <Avatar 
                    src={user?.profilePicture} 
                    size="sm" 
                    radius="xl" 
                    style={{
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </ActionIcon>
              )}
              <Burger
                opened={mobileMenuOpened}
                onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
                color="white"
                size="sm"
                style={{
                  '& > div': {
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease'
                  }
                }}
              />
            </Group>
          )}
        </Group>

        {/* Mobile Menu Collapse */}
        {isMobile && (
          <Collapse in={mobileMenuOpened}>
            <Container py="md">
              <Stack gap="sm">
                {!isAuthenticated ? (
                  <>
                    <MobileNavButton
                      icon={<IconUserPlus size={18} />}
                      label="Sign Up"
                      path="/register"
                    />
                    <MobileNavButton
                      icon={<IconLogin size={18} />}
                      label="Login"
                      path="/login"
                      variant="filled"
                    />
                  </>
                ) : (
                  <>
                    <MobileNavButton
                      icon={<IconMapPin size={18} />}
                      label="Explore Places"
                      path="/show-places"
                    />
                    <MobileNavButton
                      icon={<IconPlus size={18} />}
                      label="Add Place"
                      path="/add-place"
                    />
                    
                    {/* Role-specific mobile buttons */}
                    {user?.role?.toLowerCase() === 'caregiver' && (
                      <MobileNavButton
                        icon={<IconUsers size={18} />}
                        label="Find Disabled"
                        path="/find-disabled"
                      />
                    )}

                    {user?.role?.toLowerCase() === 'pwd' && (
                      <MobileNavButton
                        icon={<IconUsers size={18} />}
                        label="Find Caregiver"
                        path="/find-care"
                      />
                    )}

                    {user?.role?.toLowerCase() === 'admin' && (
                      <MobileNavButton
                        icon={<IconSettings size={18} />}
                        label="Admin Panel"
                        path="/admin"
                      />
                    )}

                    <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '8px 0' }} />
                    
                    <Button
                      variant="light"
                      leftSection={<IconLogout size={18} />}
                      onClick={handleLogout}
                      radius="xl"
                      fullWidth
                      justify="start"
                      style={{
                        color: '#ffffff',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </Stack>
            </Container>
          </Collapse>
        )}
      </Container>
    </Paper>
  );
}

export default MainHeader;