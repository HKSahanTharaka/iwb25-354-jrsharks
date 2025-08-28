// src/pages/PendingApproval.jsx
/*import { Alert, Button, Container, Group, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PendingApproval() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Container size="sm" my={60}>
      <Title order={2} mb="md">Account Pending Approval</Title>
      <Alert color="yellow" title="Thanks for registering!">
        Your account is awaiting admin review. You'll be able to contribute once approved.
      </Alert>
      <Group mt="lg">
        <Button variant="outline" onClick={() => navigate('/')}>Go to Home</Button>
        <Button color="red" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
      </Group>
    </Container>
  );
}

export default PendingApproval;*/
// src/pages/PendingApproval.jsx - Pending approval screen aligned with app's light theme
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Alert,
  Stack,
  ThemeIcon,
  Divider,
  Box
} from '@mantine/core';
import { IconInfoCircle, IconHome, IconLogout, IconClock } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function PendingApproval() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // "Go to Home" button - will redirect back here if still pending due to ProtectedRoute
  const handleGoHome = () => {
    navigate('/');
  };

  // "Logout" button
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box style={{ backgroundColor: '#F7FAFC', minHeight: '100vh', color: '#2C3E50' }}>
      <Container size="xl" py="md">
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          styles={{
            root: {
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#2C3E50'
            }
          }}
        >
          <Stack align="center" gap="lg">
            {/* Icon */}
            <ThemeIcon
              size={80}
              radius="xl"
              styles={{
                root: {
                  backgroundColor: '#22C55E',
                  color: 'white'
                }
              }}
            >
              <IconClock size={40} />
            </ThemeIcon>

            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              <Title order={2} mb="xs">
                Account Pending Approval
              </Title>
              <Text c="dimmed" size="sm">
                Your registration is being reviewed by our administrators
              </Text>
            </div>

            <Divider
              w="100%"
              styles={{
                root: {
                  borderColor: '#E2E8F0'
                }
              }}
            />

            {/* User Details Alert */}
            <Alert
              icon={<IconInfoCircle size={16} />}
              styles={{
                root: {
                  width: '100%',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#2C3E50'
                },
                icon: {
                  color: '#22C55E'
                },
                title: {
                  color: '#2C3E50'
                },
                body: {
                  color: '#2C3E50'
                }
              }}
              title="Account Information"
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Email:</Text>
                  <Text size="sm">{user?.email}</Text>
                </Group>
                {user?.username && (
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Username:</Text>
                    <Text size="sm">{user.username}</Text>
                  </Group>
                )}
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Role:</Text>
                  <Text size="sm">{user?.role}</Text>
                </Group>
              </Stack>
            </Alert>

            {/* Information Text - explaining the pending state */}
            <Stack gap="sm" align="center">
              <Text ta="center" c="dimmed" size="sm" px="md">
                Your account is currently under review by our administrators.
                You will receive an email notification once your account has been approved
                and you can access the full system.
              </Text>

              <Text ta="center" c="dimmed" size="xs" px="md">
                If you have any questions or need immediate access,
                please contact your system administrator.
              </Text>
            </Stack>

            <Divider
              w="100%"
              styles={{
                root: {
                  borderColor: '#E2E8F0'
                }
              }}
            />

            {/* Action Buttons - "Go to Home" and "Logout" as required */}
            <Group justify="center" gap="sm" mt="md">
              <Button
                variant="filled"
                leftSection={<IconHome size={16} />}
                onClick={handleGoHome}
                styles={{
                  root: {
                    backgroundColor: '#22C55E',
                    color: 'white',
                    '&:hover': { backgroundColor: '#16A34A' }
                  }
                }}
              >
                Go to Home
              </Button>
              <Button
                variant="outline"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
                styles={{
                  root: {
                    borderColor: '#E53E3E',
                    color: '#E53E3E',
                    '&:hover': { backgroundColor: '#E53E3E', color: 'white' }
                  }
                }}
              >
                Logout
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default PendingApproval;