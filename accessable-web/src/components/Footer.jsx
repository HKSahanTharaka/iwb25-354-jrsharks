// src/components/Footer.jsx - Modern styled global footer
import { Container, Group, Paper, Text, Stack, Divider, Box } from '@mantine/core';
import { 
  IconMapPin, 
  IconPlus, 
  IconUser, 
  IconHome,
  IconHeart,
  IconAccessible
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Hide footer on auth pages and admin routes
  const hideFooterPaths = ['/login', '/register'];
  const isAdmin = location.pathname.startsWith('/admin');
  if (hideFooterPaths.includes(location.pathname) || isAdmin) {
    return null;
  }

  const FooterLink = ({ icon, label, path, color = "blue" }) => (
    <Group 
      gap="xs" 
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '8px 12px',
        borderRadius: '12px',
        backgroundColor: location.pathname === path ? 'rgba(139, 69, 195, 0.15)' : 'transparent'
      }}
      onClick={() => navigate(path)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(139, 69, 195, 0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 195, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = location.pathname === path ? 'rgba(139, 69, 195, 0.15)' : 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Box 
        style={{
          color: location.pathname === path ? '#8b45c3' : '#64748b',
          transition: 'all 0.3s ease'
        }}
      >
        {icon}
      </Box>
      <Text 
        size="sm" 
        style={{
          fontWeight: location.pathname === path ? 600 : 500,
          color: location.pathname === path ? '#8b45c3' : '#64748b',
          transition: 'all 0.3s ease'
        }}
      >
        {label}
      </Text>
    </Group>
  );

  return (
    <Paper 
      shadow="lg" 
      withBorder={false}
      mt="xl"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(139, 69, 195, 0.2)',
        boxShadow: '0 -4px 20px rgba(139, 69, 195, 0.1)'
      }}
    >
      <Container size="xl" py={isMobile ? "lg" : "xl"}>
        {isMobile ? (
          // Mobile Layout - Stacked
          <Stack gap="lg" align="center">
            {/* Brand Section */}
            <Group gap="xs" align="center">
              <IconAccessible 
                size={28} 
                style={{
                  color: '#8b45c3'
                }}
              />
              <Text 
                size="lg" 
                fw={800} 
                style={{
                  color: '#8b45c3',
                  letterSpacing: '0.5px'
                }}
              >
                AccessAble
              </Text>
            </Group>

            <Text 
              size="sm" 
              ta="center" 
              c="dimmed" 
              maw={300}
              style={{
                lineHeight: 1.6,
                color: '#64748b'
              }}
            >
              Making Sri Lanka accessible for everyone. Discover and share accessible places with our community.
            </Text>

            {/* Navigation Links */}
            <Group gap="md" justify="center" wrap="wrap">
              <FooterLink 
                icon={<IconHome size={18} />}
                label="Home"
                path="/"
              />
              <FooterLink 
                icon={<IconMapPin size={18} />}
                label="Explore"
                path="/show-places"
              />
              <FooterLink 
                icon={<IconPlus size={18} />}
                label="Add Place"
                path="/add-place"
              />
              <FooterLink 
                icon={<IconUser size={18} />}
                label="Profile"
                path="/profile"
              />
            </Group>

            <Divider 
              w="100%" 
              style={{
                borderColor: 'rgba(139, 69, 195, 0.15)'
              }}
            />

            {/* Copyright */}
            <Group gap="xs" align="center">
              <Text 
                size="xs" 
                style={{
                  color: '#64748b'
                }}
              >
                © {new Date().getFullYear()} AccessAble Sri Lanka
              </Text>
              <Text 
                size="xs" 
                style={{
                  color: '#94a3b8'
                }}
              >
                •
              </Text>
              <Group gap={4} align="center">
                <Text 
                  size="xs" 
                  style={{
                    color: '#64748b'
                  }}
                >
                  Made with
                </Text>
                <IconHeart 
                  size={12} 
                  style={{
                    color: '#ef4444',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <Text 
                  size="xs" 
                  style={{
                    color: '#64748b'
                  }}
                >
                  for accessibility
                </Text>
              </Group>
            </Group>
          </Stack>
        ) : (
          // Desktop Layout
          <Stack gap="xl">
            {/* Top Section */}
            <Group justify="space-between" align="flex-start">
              {/* Brand and Description */}
              <Stack gap="md" maw={400}>
                <Group gap="xs" align="center">
                  <IconAccessible 
                    size={32} 
                    style={{
                      color: '#8b45c3'
                    }}
                  />
                  <Text 
                    size="xl" 
                    fw={800} 
                    style={{
                      color: '#8b45c3',
                      letterSpacing: '0.5px'
                    }}
                  >
                    AccessAble Sri Lanka
                  </Text>
                </Group>
                <Text 
                  size="sm" 
                  style={{
                    color: '#64748b',
                    lineHeight: 1.6
                  }}
                >
                  Empowering accessibility across Sri Lanka. Discover wheelchair-friendly places, 
                  share your experiences, and help build a more inclusive community for everyone.
                </Text>
              </Stack>

              {/* Quick Links */}
              <Stack gap="lg" style={{ minWidth: '200px' }}>
                <Text 
                  size="sm" 
                  fw={600} 
                  style={{
                    color: '#374151'
                  }}
                >
                  Quick Navigation
                </Text>
                <Stack gap="sm">
                  <FooterLink 
                    icon={<IconHome size={18} />}
                    label="Home"
                    path="/"
                  />
                  <FooterLink 
                    icon={<IconMapPin size={18} />}
                    label="Explore Places"
                    path="/show-places"
                  />
                  <FooterLink 
                    icon={<IconPlus size={18} />}
                    label="Add New Place"
                    path="/add-place"
                  />
                  <FooterLink 
                    icon={<IconUser size={18} />}
                    label="My Profile"
                    path="/profile"
                  />
                </Stack>
              </Stack>
            </Group>

            <Divider 
              style={{
                borderColor: 'rgba(139, 69, 195, 0.15)'
              }}
            />

            {/* Bottom Section */}
            <Group justify="space-between" align="center">
              <Text 
                size="sm" 
                style={{
                  color: '#64748b'
                }}
              >
                © {new Date().getFullYear()} AccessAble Sri Lanka. Building bridges to accessibility.
              </Text>
              
              <Group gap="xs" align="center">
                <Text 
                  size="sm" 
                  style={{
                    color: '#64748b'
                  }}
                >
                  Made with
                </Text>
                <IconHeart 
                  size={16} 
                  style={{
                    color: '#ef4444',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <Text 
                  size="sm" 
                  style={{
                    color: '#64748b'
                  }}
                >
                  for a more accessible world
                </Text>
              </Group>
            </Group>
          </Stack>
        )}
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Paper>
  );
}

export default Footer;