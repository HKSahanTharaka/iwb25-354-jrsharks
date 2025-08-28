// src/pages/PendingPlaces.jsx - Admin: list pending places (skeleton, awaiting backend)
import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Group,
  Table,
  Title,
  Badge,
  Alert,
  ActionIcon,
  Paper,
  Stack,
  Text,
  Box,
  Center,
  Button
} from '@mantine/core';
import { IconRefresh, IconMapPin, IconCheck, IconX } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api.js';

function PendingPlaces() {
  const { token } = useAuth();
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Placeholder endpoint; update when backend is ready
      const res = await fetch(buildApiUrl('admin/places/pending'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = text; }
      }

      if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.error || 'Failed to fetch pending places'));

      setPendingPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch pending places error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

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
                <IconMapPin size={28} color="white" />
              </Box>
              <Title 
                order={1} 
                style={{ 
                  color: '#2d3748',
                  fontSize: '2rem',
                  fontWeight: 600
                }}
              >
                Pending Places
              </Title>
              {pendingPlaces.length > 0 && (
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
                  {pendingPlaces.length} pending
                </Badge>
              )}
            </Group>
            <Text 
              size="lg" 
              c="dimmed" 
              ta="center"
              style={{ color: '#64748b' }}
            >
              Review and approve submitted places
            </Text>
          </Stack>
          
          <ActionIcon
            variant="subtle"
            onClick={fetchPending}
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
            title="Refresh pending places"
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
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconMapPin size={18} color="white" />
              </Box>
              <Title 
                order={3} 
                style={{ 
                  color: '#2d3748',
                  fontWeight: 600
                }}
              >
                Places Awaiting Review
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
                      Place Name
                    </Table.Th>
                    <Table.Th style={{ 
                      fontWeight: 600,
                      color: '#475569',
                      padding: '1rem'
                    }}>
                      Location
                    </Table.Th>
                    <Table.Th style={{ 
                      fontWeight: 600,
                      color: '#475569',
                      padding: '1rem'
                    }}>
                      Submitted By
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
                  {pendingPlaces.length === 0 ? (
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
                              <IconMapPin size={24} color="#94a3b8" />
                            </Box>
                            <Text 
                              size="lg" 
                              c="dimmed"
                              style={{ color: '#64748b' }}
                            >
                              {loading ? 'Loading pending places...' : 'No pending places to review'}
                            </Text>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    pendingPlaces.map((p) => (
                      <Table.Tr 
                        key={p.id || p.name}
                        style={{ 
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <Table.Td style={{ padding: '1rem' }}>
                          <Text 
                            fw={500}
                            style={{ color: '#2d3748' }}
                          >
                            {p.name}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ padding: '1rem' }}>
                          <Text style={{ color: '#64748b' }}>
                            {p.location}
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
                            {p.addedBy || 'Unknown'}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ padding: '1rem' }}>
                          <Group gap="xs">
                            <Button
                              size="xs"
                              leftSection={<IconCheck size={14} />}
                              onClick={async () => {
                                setActionLoading(p.id);
                                setError('');
                                try {
                                  const res = await fetch(buildApiUrl('admin/places/approve'), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ id: p.id })
                                  });
                                  if (!res.ok) throw new Error('Approve failed');
                                  await fetchPending();
                                } catch (e) { setError(e.message); }
                                finally { setActionLoading(null); }
                              }}
                              loading={actionLoading === p.id}
                              radius="md"
                              style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                border: 'none'
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              leftSection={<IconX size={14} />}
                              onClick={async () => {
                                setActionLoading(p.id + '-d');
                                setError('');
                                try {
                                  const res = await fetch(buildApiUrl('admin/places/decline'), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ id: p.id })
                                  });
                                  if (!res.ok) throw new Error('Decline failed');
                                  await fetchPending();
                                } catch (e) { setError(e.message); }
                                finally { setActionLoading(null); }
                              }}
                              loading={actionLoading === p.id + '-d'}
                              radius="md"
                              style={{
                                borderColor: '#ef4444',
                                color: '#ef4444'
                              }}
                            >
                              Decline
                            </Button>
                          </Group>
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

export default PendingPlaces;