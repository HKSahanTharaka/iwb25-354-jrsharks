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
      className="cursor-pointer group transition-all duration-200 ease-out hover:-translate-y-0.5"
      onClick={() => navigate(path)}
    >
      <Box className={`transition-colors duration-200 ${
        color === 'blue' ? 'group-hover:text-blue-500' :
        color === 'emerald' ? 'group-hover:text-emerald-500' :
        color === 'amber' ? 'group-hover:text-amber-500' :
        'group-hover:text-purple-500'
      }`}>
        {icon}
      </Box>
      <Text 
        size="sm" 
        className={`
          transition-all duration-200 font-medium
          ${color === 'blue' ? 'group-hover:text-blue-600' :
            color === 'emerald' ? 'group-hover:text-emerald-600' :
            color === 'amber' ? 'group-hover:text-amber-600' :
            'group-hover:text-purple-600'
          }
          ${location.pathname === path ? 
            (color === 'blue' ? 'text-blue-600' :
             color === 'emerald' ? 'text-emerald-600' :
             color === 'amber' ? 'text-amber-600' :
             'text-purple-600') : 'text-slate-600'
          }
        `}
      >
        {label}
      </Text>
    </Group>
  );

  return (
    <Paper 
      shadow="xl" 
      withBorder 
      mt="xl"
      className="
        bg-gradient-to-br from-slate-50 to-slate-100/50
        border-slate-200/60
        backdrop-blur-sm
      "
    >
      <Container size="xl" py={isMobile ? "lg" : "xl"}>
        {isMobile ? (
          // Mobile Layout - Stacked
          <Stack gap="lg" align="center">
            {/* Brand Section */}
            <Group gap="xs" align="center">
              <IconAccessible 
                size={28} 
                className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
              <Text 
                size="lg" 
                fw={800} 
                className="
                  bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
                "
              >
                AccessAble
              </Text>
            </Group>

            <Text size="sm" ta="center" c="dimmed" maw={300}>
              Making Sri Lanka accessible for everyone. Discover and share accessible places with our community.
            </Text>

            {/* Navigation Links */}
            <Group gap="xl" justify="center" wrap="wrap">
              <FooterLink 
                icon={<IconHome size={18} />}
                label="Home"
                path="/"
                color="blue"
              />
              <FooterLink 
                icon={<IconMapPin size={18} />}
                label="Explore"
                path="/show-places"
                color="amber"
              />
              <FooterLink 
                icon={<IconPlus size={18} />}
                label="Add Place"
                path="/add-place"
                color="emerald"
              />
              <FooterLink 
                icon={<IconUser size={18} />}
                label="Profile"
                path="/profile"
                color="purple"
              />
            </Group>

            <Divider w="100%" color="slate.2" />

            {/* Copyright */}
            <Group gap="xs" align="center">
              <Text size="xs" c="dimmed">
                © {new Date().getFullYear()} AccessAble Sri Lanka
              </Text>
              <Text size="xs" c="dimmed">•</Text>
              <Group gap={4} align="center">
                <Text size="xs" c="dimmed">Made with</Text>
                <IconHeart size={12} className="text-red-400" />
                <Text size="xs" c="dimmed">for accessibility</Text>
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
                    className="text-blue-600"
                  />
                  <Text 
                    size="xl" 
                    fw={800} 
                    className="
                      bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
                    "
                  >
                    AccessAble Sri Lanka
                  </Text>
                </Group>
                <Text size="sm" c="dimmed" lh={1.6}>
                  Empowering accessibility across Sri Lanka. Discover wheelchair-friendly places, 
                  share your experiences, and help build a more inclusive community for everyone.
                </Text>
              </Stack>

              {/* Quick Links */}
              <Stack gap="lg">
                <Text size="sm" fw={600} className="text-slate-700">
                  Quick Navigation
                </Text>
                <Stack gap="sm">
                  <FooterLink 
                    icon={<IconHome size={18} />}
                    label="Home"
                    path="/"
                    color="blue"
                  />
                  <FooterLink 
                    icon={<IconMapPin size={18} />}
                    label="Explore Places"
                    path="/show-places"
                    color="amber"
                  />
                  <FooterLink 
                    icon={<IconPlus size={18} />}
                    label="Add New Place"
                    path="/add-place"
                    color="emerald"
                  />
                  <FooterLink 
                    icon={<IconUser size={18} />}
                    label="My Profile"
                    path="/profile"
                    color="purple"
                  />
                </Stack>
              </Stack>
            </Group>

            <Divider color="slate.2" />

            {/* Bottom Section */}
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                © {new Date().getFullYear()} AccessAble Sri Lanka. Building bridges to accessibility.
              </Text>
              
              <Group gap="xs" align="center">
                <Text size="sm" c="dimmed">Made with</Text>
                <IconHeart size={16} className="text-red-400 animate-pulse" />
                <Text size="sm" c="dimmed">for a more accessible world</Text>
              </Group>
            </Group>
          </Stack>
        )}
      </Container>
    </Paper>
  );
}

export default Footer;