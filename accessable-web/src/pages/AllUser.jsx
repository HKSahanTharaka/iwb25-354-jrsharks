// src/pages/AllUsersPage.jsx - Dedicated page for managing all users
import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Group,
  Table,
  Title,
  Badge,
  Loader,
  Center,
  Alert,
  Button,
  ActionIcon,
  Text,
  Paper,
  Stack,
  Modal,
  Box,
  Select,
  TextInput,
  Grid,
  Card,
  Avatar,
  Flex
} from '@mantine/core';
import { 
  IconRefresh, 
  IconUsers, 
  IconEye, 
  IconSearch,
  IconFilter,
  IconShield,
  IconHeart,
  IconUser,
  IconX,
  IconTrash,
  IconBan
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api.js';

function AllUsersPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // State for all users
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  
  // UI states
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetEmail, setDeleteTargetEmail] = useState('');
  
  // User detail modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch all users from backend
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(buildApiUrl('admin/users/all'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textData = await res.text();
        try {
          data = JSON.parse(textData);
        } catch {
          data = textData;
        }
      }

      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : (data.error || 'Failed to fetch all users'));
      }

      const users = Array.isArray(data) ? data : [];
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (err) {
      console.error('Fetch all users error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Filter users based on role, search query, and approval status
  useEffect(() => {
    let filtered = [...allUsers];

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.role && user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Filter by approval status
    if (approvalFilter !== 'all') {
      if (approvalFilter === 'approved') {
        filtered = filtered.filter(user => user.isApproved);
      } else if (approvalFilter === 'pending') {
        filtered = filtered.filter(user => !user.isApproved);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user =>
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.firstName && user.firstName.toLowerCase().includes(query)) ||
        (user.lastName && user.lastName.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  }, [allUsers, roleFilter, searchQuery, approvalFilter]);

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <IconShield size={16} />;
      case 'caregiver':
        return <IconHeart size={16} />;
      case 'pwd':
        return <IconUser size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#DC2626';
      case 'caregiver':
        return '#059669';
      case 'pwd':
        return '#2563EB';
      default:
        return '#6B7280';
    }
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
    setShowUserModal(true);
  };

  const withBusy = (key, fn) => async (...args) => {
    setActionBusy(prev => ({ ...prev, [key]: true }));
    try {
      await fn(...args);
    } finally {
      setActionBusy(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleUnapprove = withBusy('unapprove', async (email) => {
    setError('');
    try {
      const res = await fetch(buildApiUrl(`admin/users/unapprove/${encodeURIComponent(email)}`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to unapprove user');
      }
      setAllUsers(prev => prev.map(u => u.email === email ? { ...u, isApproved: false } : u));
    } catch (e) {
      setError(e.message);
    }
  });

  const handleDelete = withBusy('delete', async (email) => {
    setError('');
    try {
      const res = await fetch(buildApiUrl(`admin/users/${encodeURIComponent(email)}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete user');
      }
      setAllUsers(prev => prev.filter(u => u.email !== email));
      setShowDeleteModal(false);
      setDeleteTargetEmail('');
    } catch (e) {
      setError(e.message);
    }
  });

  const openDeleteConfirm = (email) => {
    setDeleteTargetEmail(email);
    setShowDeleteModal(true);
  };

  const resetFilters = () => {
    setRoleFilter('all');
    setSearchQuery('');
    setApprovalFilter('all');
  };

  const getStatusCounts = () => {
    const total = allUsers.length;
    const approved = allUsers.filter(u => u.isApproved).length;
    const pending = allUsers.filter(u => !u.isApproved).length;
    const admins = allUsers.filter(u => u.role?.toLowerCase() === 'admin').length;
    const caregivers = allUsers.filter(u => u.role?.toLowerCase() === 'caregiver').length;
    const pwds = allUsers.filter(u => u.role?.toLowerCase() === 'pwd').length;
    
    return { total, approved, pending, admins, caregivers, pwds };
  };

  const counts = getStatusCounts();

  return (
    <>
      {/* User Detail Modal */}
      <Modal
        opened={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        centered
        size="md"
        radius="lg"
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#2d3748',
          },
          header: {
            background: 'transparent',
            color: '#2d3748',
            fontWeight: 600
          }
        }}
      >
        {selectedUser && (
          <Stack gap="md">
            <Center>
              <Avatar 
                src={selectedUser.profilePicture}
                size={80} 
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: getRoleColor(selectedUser.role),
                    color: 'white'
                  }
                }}
              >
                {selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : 
                 selectedUser.email ? selectedUser.email.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </Center>

            <Card
              radius="md"
              styles={{
                root: {
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(226, 232, 240, 0.5)'
                }
              }}
            >
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" fw={500}>Username</Text>
                  <Text>{selectedUser.username || 'N/A'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" fw={500}>Email</Text>
                  <Text>{selectedUser.email}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" fw={500}>Role</Text>
                  <Group gap="xs">
                    {getRoleIcon(selectedUser.role)}
                    <Badge 
                      variant="filled"
                      styles={{
                        root: {
                          backgroundColor: getRoleColor(selectedUser.role),
                          color: 'white'
                        }
                      }}
                    >
                      {selectedUser.role}
                    </Badge>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" fw={500}>Status</Text>
                  <Badge 
                    variant="filled"
                    styles={{
                      root: {
                        backgroundColor: selectedUser.isApproved ? '#10b981' : '#f59e0b',
                        color: 'white'
                      }
                    }}
                  >
                    {selectedUser.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </Grid.Col>
                {selectedUser.firstName && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed" fw={500}>First Name</Text>
                    <Text>{selectedUser.firstName}</Text>
                  </Grid.Col>
                )}
                {selectedUser.lastName && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed" fw={500}>Last Name</Text>
                    <Text>{selectedUser.lastName}</Text>
                  </Grid.Col>
                )}
                {selectedUser.phone && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed" fw={500}>Phone</Text>
                    <Text>{selectedUser.phone}</Text>
                  </Grid.Col>
                )}
                {selectedUser.address && (
                  <Grid.Col span={12}>
                    <Text size="sm" c="dimmed" fw={500}>Address</Text>
                    <Text>{selectedUser.address}</Text>
                  </Grid.Col>
                )}
                {selectedUser.dateOfBirth && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed" fw={500}>Date of Birth</Text>
                    <Text>{new Date(selectedUser.dateOfBirth).toLocaleDateString()}</Text>
                  </Grid.Col>
                )}
                {selectedUser.createdAt && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed" fw={500}>Joined Date</Text>
                    <Text>{new Date(selectedUser.createdAt).toLocaleDateString()}</Text>
                  </Grid.Col>
                )}
              </Grid>
            </Card>

            <Button 
              fullWidth 
              variant="light" 
              color="blue"
              radius="md"
              onClick={() => setShowUserModal(false)}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none'
              }}
            >
              Close
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteModal}
        onClose={() => { if (!actionBusy.delete) { setShowDeleteModal(false); setDeleteTargetEmail(''); } }}
        title="Confirm Deletion"
        centered
        size="sm"
        radius="lg"
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#2d3748'
          },
          header: {
            background: 'transparent',
            color: '#2d3748',
            fontWeight: 600
          }
        }}
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to permanently delete user{' '} 
            <Text span fw={600}>{deleteTargetEmail}</Text>? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)} 
              disabled={!!actionBusy.delete}
              radius="md"
              style={{ borderColor: '#64748b', color: '#64748b' }}
            >
              Cancel
            </Button>
            <Button 
              loading={!!actionBusy.delete} 
              onClick={() => handleDelete(deleteTargetEmail)}
              radius="md"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none'
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

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
                  User Management
                </Title>
                <Badge 
                  size="lg" 
                  variant="filled"
                  style={{ 
                    background: '#10b981',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {counts.total} total users
                </Badge>
              </Group>
              <Text 
                size="lg" 
                c="dimmed" 
                ta="center"
                style={{ color: '#64748b' }}
              >
                Manage and view all registered users in the system
              </Text>
            </Stack>
            
            <ActionIcon
              variant="subtle"
              onClick={fetchAllUsers}
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
              title="Refresh users data"
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Paper>
        </Container>

        <Container size="lg">
          {/* Error Alert */}
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

          {/* Statistics Cards */}
          <Grid mb="lg">
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Paper
                p="md"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text size="xl" fw={700} style={{ color: '#2d3748' }}>{counts.total}</Text>
                <Text size="sm" c="dimmed">Total Users</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Paper
                p="md"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text size="xl" fw={700} style={{ color: '#10b981' }}>{counts.approved}</Text>
                <Text size="sm" c="dimmed">Approved</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Paper
                p="md"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text size="xl" fw={700} style={{ color: '#f59e0b' }}>{counts.pending}</Text>
                <Text size="sm" c="dimmed">Pending</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Paper
                p="md"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text size="xl" fw={700} style={{ color: '#dc2626' }}>{counts.admins}</Text>
                <Text size="sm" c="dimmed">Admins</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Paper
                p="md"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text size="xl" fw={700} style={{ color: '#059669' }}>{counts.caregivers}</Text>
                <Text size="sm" c="dimmed">Caregivers</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Paper
                p="md"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text size="xl" fw={700} style={{ color: '#2563eb' }}>{counts.pwds}</Text>
                <Text size="sm" c="dimmed">PWDs</Text>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Filters Section */}
          <Paper 
            p="lg" 
            mb="lg"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Stack gap="md">
              <Group gap="sm">
                <Box
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconFilter size={18} color="white" />
                </Box>
                <Text fw={600} style={{ color: '#2d3748' }}>Filter & Search</Text>
              </Group>
              
              <Group gap="md" wrap="wrap">
                <Select
                  placeholder="Filter by Role"
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value || 'all')}
                  data={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'caregiver', label: 'Caregiver' },
                    { value: 'pwd', label: 'PWD' }
                  ]}
                  radius="md"
                  style={{ minWidth: '150px' }}
                />

                <Select
                  placeholder="Filter by Status"
                  value={approvalFilter}
                  onChange={(value) => setApprovalFilter(value || 'all')}
                  data={[
                    { value: 'all', label: 'All Status' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'pending', label: 'Pending' }
                  ]}
                  radius="md"
                  style={{ minWidth: '150px' }}
                />

                <TextInput
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  radius="md"
                  style={{ minWidth: '200px', flex: 1 }}
                />

                <Button 
                  variant="outline"
                  onClick={resetFilters}
                  leftSection={<IconX size={16} />}
                  radius="md"
                  style={{
                    borderColor: '#64748b',
                    color: '#64748b'
                  }}
                >
                  Clear Filters
                </Button>
              </Group>
            </Stack>
          </Paper>

          {/* Results Info */}
          <Paper 
            p="md" 
            mb="lg"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Flex justify="space-between" align="center">
              <Text style={{ color: '#2d3748' }}>
                Showing <strong>{filteredUsers.length}</strong> of <strong>{allUsers.length}</strong> users
              </Text>
              {(roleFilter !== 'all' || searchQuery || approvalFilter !== 'all') && (
                <Badge variant="light" color="blue">
                  Filters Active
                </Badge>
              )}
            </Flex>
          </Paper>

          {/* Users Table */}
          <Paper 
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <Center py="3rem">
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      background: '#f1f5f9',
                      borderRadius: '50%',
                      padding: '1rem'
                    }}
                  >
                    <Loader size="lg" color="#667eea" />
                  </Box>
                  <Text size="lg" style={{ color: '#64748b' }}>Loading users...</Text>
                </Stack>
              </Center>
            ) : (
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
                        User
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
                        Status
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
                    {filteredUsers.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
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
                                fw={500}
                                style={{ color: '#64748b' }}
                              >
                                {searchQuery || roleFilter !== 'all' || approvalFilter !== 'all' 
                                  ? 'No users match your filters' 
                                  : 'No users found'}
                              </Text>
                              <Text 
                                size="sm"
                                style={{ color: '#94a3b8' }}
                              >
                                {searchQuery || roleFilter !== 'all' || approvalFilter !== 'all' 
                                  ? 'Try adjusting your search criteria' 
                                  : 'Users will appear here once registered'}
                              </Text>
                            </Stack>
                          </Center>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredUsers.map((userData) => (
                        <Table.Tr 
                          key={userData.email || userData.id}
                          style={{ 
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <Table.Td style={{ padding: '1rem' }}>
                            <Group gap="sm">
                              <Avatar 
                                src={userData.profilePicture}
                                size={40} 
                                radius="xl"
                                styles={{
                                  root: {
                                    backgroundColor: getRoleColor(userData.role),
                                    color: 'white'
                                  }
                                }}
                              >
                                {userData.username ? userData.username.charAt(0).toUpperCase() : 
                                 userData.email ? userData.email.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                              <Text fw={500} style={{ color: '#2d3748' }}>
                                {userData.username || 'N/A'}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td style={{ padding: '1rem' }}>
                            <Text style={{ color: '#64748b' }}>
                              {userData.email}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ padding: '1rem' }}>
                            <Group gap="xs">
                              {getRoleIcon(userData.role)}
                              <Badge 
                                variant="light" 
                                size="sm"
                                styles={{
                                  root: {
                                    backgroundColor: getRoleColor(userData.role),
                                    color: 'white'
                                  }
                                }}
                              >
                                {userData.role}
                              </Badge>
                            </Group>
                          </Table.Td>
                          <Table.Td style={{ padding: '1rem' }}>
                            <Badge 
                              variant="light"
                              size="sm"
                              styles={{
                                root: {
                                  backgroundColor: userData.isApproved ? '#10b981' : '#f59e0b',
                                  color: 'white'
                                }
                              }}
                            >
                              {userData.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ padding: '1rem' }}>
                            <Group gap="xs">
                              <ActionIcon 
                                variant="light"
                                color="blue"
                                onClick={() => handleViewUser(userData)}
                                title="View Details"
                                radius="md"
                                size="sm"
                                style={{
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: '#3b82f6'
                                }}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                              {userData.isApproved && userData.role?.toLowerCase() !== 'admin' && (
                                <ActionIcon
                                  variant="light"
                                  onClick={() => handleUnapprove(userData.email)}
                                  title="Unapprove User"
                                  loading={!!actionBusy.unapprove}
                                  radius="md"
                                  size="sm"
                                  style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: '#f59e0b'
                                  }}
                                >
                                  <IconBan size={16} />
                                </ActionIcon>
                              )}
                              {userData.role?.toLowerCase() !== 'admin' && (
                                <ActionIcon
                                  variant="light"
                                  onClick={() => openDeleteConfirm(userData.email)}
                                  title="Delete User"
                                  loading={!!actionBusy.delete}
                                  radius="md"
                                  size="sm"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444'
                                  }}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default AllUsersPage;