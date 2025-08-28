import { useEffect, useState, useCallback } from "react";
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
  Stack,
  Text,
  Paper,
  Modal,
  Box,
  ActionIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl } from '../config/api.js';

function PendingReviews() {
  const { token, user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(buildApiUrl('admin/reviews/pending'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
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
        throw new Error(
          typeof data === "string"
            ? data
            : data.error || "Failed to fetch pending reviews"
        );
      }

      setPendingReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleReviewAction = async (review, action) => {
    setActionLoading(review.id);
    try {
      const res = await fetch(buildApiUrl(`admin/reviews/${action}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: review.id }),
      });

      const contentType = res.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
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
        throw new Error(
          typeof data === "string" ? data : data.error || `${action} failed`
        );
      }

      setSuccessMessage(
        `Review ${action === "approve" ? "approved" : "declined"} successfully`
      );
      setShowSuccessModal(true);
      await fetchPending();
    } catch (err) {
      console.error(`${action} error:`, err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {/* Success Modal */}
      <Modal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        centered
        size="sm"
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
            fontWeight: 600,
          },
        }}
      >
        <Stack align="center" gap="md" py="md">
          <Box
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconCheck size={32} color="white" />
          </Box>
          <Text ta="center" size="lg" fw={500} style={{ color: '#2d3748' }}>
            {successMessage}
          </Text>
          <Button
            onClick={() => setShowSuccessModal(false)}
            fullWidth
            radius="md"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none'
            }}
          >
            Done
          </Button>
        </Stack>
      </Modal>

      {/* Page content */}
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
                  <IconMessageCircle size={28} color="white" />
                </Box>
                <Title 
                  order={1} 
                  style={{ 
                    color: '#2d3748',
                    fontSize: '2rem',
                    fontWeight: 600
                  }}
                >
                  Pending Reviews
                </Title>
                {pendingReviews.length > 0 && (
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
                    {pendingReviews.length} pending
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
              title="Refresh pending reviews"
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
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconMessageCircle size={18} color="white" />
                </Box>
                <Title 
                  order={3} 
                  style={{ 
                    color: '#2d3748',
                    fontWeight: 600
                  }}
                >
                  Reviews Awaiting Approval
                </Title>
              </Group>

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
                    <Text size="lg" style={{ color: '#64748b' }}>
                      Loading pending reviews...
                    </Text>
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
                          User Email
                        </Table.Th>
                        <Table.Th style={{ 
                          fontWeight: 600,
                          color: '#475569',
                          padding: '1rem'
                        }}>
                          Place
                        </Table.Th>
                        <Table.Th style={{ 
                          fontWeight: 600,
                          color: '#475569',
                          padding: '1rem'
                        }}>
                          Review Content
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
                      {pendingReviews.length === 0 ? (
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
                                  <IconMessageCircle size={24} color="#94a3b8" />
                                </Box>
                                <Text 
                                  size="lg" 
                                  fw={500}
                                  style={{ color: '#64748b' }}
                                >
                                  No pending reviews
                                </Text>
                                <Text 
                                  size="sm"
                                  style={{ color: '#94a3b8' }}
                                >
                                  All reviews have been processed
                                </Text>
                              </Stack>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        pendingReviews.map((r) => (
                          <Table.Tr 
                            key={r.id}
                            style={{ 
                              borderBottom: '1px solid #f1f5f9'
                            }}
                          >
                            <Table.Td style={{ padding: '1rem' }}>
                              <Text 
                                fw={500}
                                style={{ color: '#2d3748' }}
                              >
                                {r.email || r.userEmail || "N/A"}
                              </Text>
                            </Table.Td>
                            <Table.Td style={{ padding: '1rem' }}>
                              <Badge 
                                variant="light"
                                style={{
                                  background: '#ddd6fe',
                                  color: '#7c3aed',
                                  border: 'none'
                                }}
                              >
                                {r.placeName || r.placeId}
                              </Badge>
                            </Table.Td>
                            <Table.Td style={{ padding: '1rem' }}>
                              <Text
                                style={{
                                  maxWidth: "300px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  color: '#64748b',
                                  whiteSpace: 'nowrap'
                                }}
                                title={r.reviewText || "No content"}
                              >
                                {r.reviewText || "No content"}
                              </Text>
                            </Table.Td>
                            <Table.Td style={{ padding: '1rem' }}>
                              <Group gap="xs">
                                <Button
                                  size="xs"
                                  leftSection={<IconCheck size={14} />}
                                  onClick={() => handleReviewAction(r, "approve")}
                                  loading={actionLoading === r.id}
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
                                  onClick={() => handleReviewAction(r, "decline")}
                                  loading={actionLoading === r.id}
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
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default PendingReviews;