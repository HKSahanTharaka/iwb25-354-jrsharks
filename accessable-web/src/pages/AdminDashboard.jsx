// src/pages/AdminDashboard.jsx - Admin dashboard showing pending users
import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Group,
  Title,
  Text,
  Paper,
  Stack,
  Box,
  Table,
  Badge,
  Alert,
  ActionIcon,
  Button,
  Center
} from '@mantine/core';
import { IconUsers, IconRefresh, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api.js';

function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingEmail, setActionLoadingEmail] = useState(null);

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(buildApiUrl('admin/users/pending'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = text; }
      }

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : (data.error || 'Failed to fetch pending users'));
      }

      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch pending users error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPendingUsers();
    }
  }, [token, fetchPendingUsers]);

  const approveUser = async (email) => {
    setActionLoadingEmail(email);
    setError('');
    try {
      const res = await fetch(buildApiUrl('admin/users/approve'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = text; }
      }

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : (data.error || 'Approve failed'));
      }

      await fetchPendingUsers();
    } catch (err) {
      console.error('Approve user error:', err);
      setError(err.message);
    } finally {
      setActionLoadingEmail(null);
    }
  };

  if (!token) {
    return (
      <Container size="xl" py="md">
        <Text c="dimmed">Redirecting to login...</Text>
      </Container>
    );
  }

  return (
    <Box 
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '2rem 0'
      }}
    >
      {/* Dashboard Header */}
      <Container size="lg" mb="xl">
        <Paper
          p="xl"
          radius="lg"
          shadow="md"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative'
          }}
        >
          <Stack align="center" gap="md">
            <Group gap="sm" align="center">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconUsers size={28} color="white" />
              </Box>
              <Title 
                order={1} 
                style={{ 
                  color: '#2d3748',
                  fontSize: '2rem',
                  fontWeight: 600
                }}
              >
                Admin Dashboard
              </Title>
              {pendingUsers.length > 0 && (
                <Badge 
                  size="lg" 
                  variant="filled"
                  style={{ 
                    background: '#f59e0b',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {pendingUsers.length} pending
                </Badge>
              )}
            </Group>
            <Text 
              size="lg" 
              c="dimmed" 
              ta="center"
              style={{ color: '#64748b' }}
            >
              Welcome back, <strong>{user?.email || user?.username}</strong> • {user?.role}
            </Text>
          </Stack>
          
          <ActionIcon
            variant="subtle"
            onClick={fetchPendingUsers}
            loading={loading}
            size="lg"
            radius="md"
            style={{ 
              position: 'absolute', 
              top: '1rem', 
              right: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea'
            }}
            title="Refresh pending users"
          >
            <IconRefresh size={20} />
          </ActionIcon>
        </Paper>
      </Container>

      {/* Main Content */}
      <Container size="lg">
        {error && (
          <Alert 
            color="red" 
            mb="lg" 
            title="Error" 
            onClose={() => setError('')} 
            withCloseButton
            radius="md"
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {error}
          </Alert>
        )}

        <Paper
          p="xl"
          radius="lg"
          shadow="md"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Stack gap="lg">
            <Group gap="sm" mb="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconUsers size={18} color="white" />
              </Box>
              <Title 
                order={3} 
                style={{ 
                  color: '#2d3748',
                  fontWeight: 600
                }}
              >
                Pending User Approvals
              </Title>
            </Group>

            <Box
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr style={{ background: '#f8fafc' }}>
                    <Table.Th style={{ 
                      fontWeight: 600,
                      color: '#475569',
                      padding: '1rem'
                    }}>
                      Username
                    </Table.Th>
                    <Table.Th style={{ 
                      fontWeight: 600,
                      color: '#475569',
                      padding: '1rem'
                    }}>
                      Email
                    </Table.Th>
                    <Table.Th style={{ 
                      fontWeight: 600,
                      color: '#475569',
                      padding: '1rem'
                    }}>
                      Role
                    </Table.Th>
                    <Table.Th style={{ 
                      fontWeight: 600,
                      color: '#475569',
                      padding: '1rem'
                    }}>
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pendingUsers.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Center py="3rem">
                          <Stack align="center" gap="sm">
                            <Box
                              style={{
                                background: '#f1f5f9',
                                borderRadius: '50%',
                                padding: '1rem'
                              }}
                            >
                              <IconUsers size={24} color="#94a3b8" />
                            </Box>
                            <Text 
                              size="lg" 
                              c="dimmed"
                              style={{ color: '#64748b' }}
                            >
                              {loading ? 'Loading pending users...' : 'No pending users to approve'}
                            </Text>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    pendingUsers.map((u) => (
                      <Table.Tr 
                        key={u.email}
                        style={{ 
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <Table.Td style={{ padding: '1rem' }}>
                          <Text 
                            fw={500}
                            style={{ color: '#2d3748' }}
                          >
                            {u.username}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ padding: '1rem' }}>
                          <Text style={{ color: '#64748b' }}>
                            {u.email}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ padding: '1rem' }}>
                          <Badge 
                            variant="light"
                            style={{
                              background: '#ede9fe',
                              color: '#7c3aed',
                              border: 'none'
                            }}
                          >
                            {u.role}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ padding: '1rem' }}>
                          <Button
                            leftSection={<IconCheck size={16} />}
                            size="sm"
                            onClick={() => approveUser(u.email)}
                            loading={actionLoadingEmail === u.email}
                            radius="md"
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none'
                            }}
                          >
                            Approve
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;