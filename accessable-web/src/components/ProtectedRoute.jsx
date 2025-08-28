// src/components/ProtectedRoute.jsx

/*import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children, requireApproved = true, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" />;

  if (requireApproved && user?.isApproved === false) return <Navigate to="/pending" />;

  return children;
}

export default ProtectedRoute;*/

// src/components/ProtectedRoute.jsx - Updated to always redirect pending users to /pending
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Alert,
  Stack,
  ThemeIcon
} from '@mantine/core';
import { IconShieldX, IconHome } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Admin Access Denied Component
function AdminAccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container size={500} py="xl">
      <Paper withBorder shadow="lg" p="xl" radius="md">
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius="xl" color="red" variant="light">
            <IconShieldX size={40} />
          </ThemeIcon>
          
          <div style={{ textAlign: 'center' }}>
            <Title order={2} mb="xs" c="red">
              Access Denied
            </Title>
            <Text c="dimmed" size="sm">
              You don't have permission to access this page
            </Text>
          </div>

          <Alert 
            color="red" 
            styles={{ root: { width: '100%' } }}
            title="Administrator Access Required"
          >
            <Text size="sm">
              You can't visit here since you are not an admin. This page is restricted to 
              administrators only. Your current role is <strong>{user?.role}</strong>.
            </Text>
            {user?.role !== 'admin' && (
              <Text size="sm" mt="xs" c="dimmed">
                If you believe you should have admin access, please contact your system administrator.
              </Text>
            )}
          </Alert>

          <Button 
            leftSection={<IconHome size={16} />}
            onClick={() => navigate('/')}
            size="md"
          >
            Go to Home
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

// Updated ProtectedRoute component
function ProtectedRoute({ children, requireApproved = true, requireAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // spinner placeholder
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Show admin access denied page instead of redirecting
  if (requireAdmin && user?.role?.toLowerCase() !== 'admin') {
    return <AdminAccessDenied />;
  }

  // Always redirect non-approved users to /pending, EXCEPT when they're already on /pending
  // or when the route explicitly allows non-approved users (requireApproved = false)
  if (requireApproved && 
      (user?.isApproved === false || user?.status === 'pending') && 
      location.pathname !== '/pending') {
    return <Navigate to="/pending" />;
  }

  return children;
}

export default ProtectedRoute;