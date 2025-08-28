import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Card,
  Button,
  Group,
  Stack,
  Badge,
  Avatar,
  Grid,
  Alert,
  Loader,
  Center,
  Paper,
  ThemeIcon,
  useMantineTheme,
  Modal,
  TextInput,
  Textarea,
  ActionIcon,
  Tooltip,
  MultiSelect,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconStar,
  IconHeart,
  IconUsers,
  IconRefresh,
  IconAlertCircle,
  IconInfoCircle,
  IconFilter,
} from "@tabler/icons-react";
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api.js';

export default function FindDisabled() {
  const [disabledUsers, setDisabledUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caregiverTraits, setCaregiverTraits] = useState([]);
  const [targetDisabilities, setTargetDisabilities] = useState([]);
  const [totalFound, setTotalFound] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);

  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role?.toLowerCase() !== 'caregiver') {
      setError("This feature is only available for caregivers.");
      return;
    }

    fetchDisabledSuggestions();
  }, [user, navigate]);

  const fetchDisabledSuggestions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(buildApiUrl('disabled/suggest'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch suggestions');
      }

      const data = await response.json();
      const rawDisabled = Array.isArray(data.suggestedDisabled) ? data.suggestedDisabled : [];
      const caregiverSkills = Array.isArray(data.caregiverTraits) ? data.caregiverTraits : [];
      const targetNeeds = Array.isArray(data.targetDisabilities) ? data.targetDisabilities : [];

      // Compute matches client-side; do NOT auto-filter or auto-sort
      const filtered = rawDisabled
        .map((d) => {
          // Normalize disabilities from backend (array, string, or stringified JSON)
          const rawDis = (d && d.disabilities) ?? [];
          let disabilities = [];
          if (Array.isArray(rawDis)) {
            disabilities = rawDis.filter((t) => typeof t === 'string');
          } else if (typeof rawDis === 'string') {
            const trimmed = rawDis.trim();
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"[') && trimmed.endsWith(']"'))) {
              try {
                const parsed = JSON.parse(trimmed.replace(/^"|"$/g, ''));
                if (Array.isArray(parsed)) {
                  disabilities = parsed.filter((t) => typeof t === 'string');
                } else {
                  disabilities = [rawDis];
                }
              } catch {
                disabilities = [rawDis];
              }
            } else {
              disabilities = [rawDis];
            }
          }
          const matchingDisabilities = targetNeeds.filter((need) =>
            disabilities.some((cond) => (cond || '').trim().toLowerCase() === (need || '').trim().toLowerCase())
          );
          const matchScore = matchingDisabilities.length;
          const matchPercentage = targetNeeds.length > 0 ? Math.floor((matchScore * 100) / targetNeeds.length) : 0;
          return {
            ...d,
            disabilities,
            matchingDisabilities,
            matchScore,
            matchPercentage
          };
        });

      setDisabledUsers(filtered);
      setCaregiverTraits(caregiverSkills);
      setTargetDisabilities(targetNeeds);
      setTotalFound(filtered.length);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching disabled suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (dUser) => {
    setSelectedUser(dUser);
    setContactForm({
      name: user?.username || "",
      email: user?.email || "",
      phone: "",
      message: `Hello ${dUser.username}, I am a caregiver with skills: ${caregiverTraits.join(', ')}. I would like to discuss how I can support your needs.`
    });
    setContactModalOpen(true);
  };

  const handleContactSubmit = async () => {
    // In a real application, this would send the contact request
    alert(
      `Contact request sent to ${selectedUser?.username}! They will receive your message and contact you soon.`
    );
    setContactModalOpen(false);
    setSelectedUser(null);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'teal';
    if (percentage >= 60) return 'blue';
    if (percentage >= 40) return 'yellow';
    return 'orange';
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Basic Match';
  };

  if (!user) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper p="xl" radius="xl" shadow="xl" style={{ background: "rgba(255, 255, 255, 0.95)" }}>
          <Center>
            <Stack align="center" gap="md">
              <Loader size="xl" color="violet" />
              <Text size="lg" fw={500}>
                Loading PWD matches...
              </Text>
            </Stack>
          </Center>
        </Paper>
      </Box>
    );
  }

  if (user.role?.toLowerCase() !== 'caregiver') {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "2rem 0",
        }}
      >
        <Container size="lg">
          <Paper p="xl" radius="xl" shadow="xl" style={{ background: "rgba(255, 255, 255, 0.95)" }}>
            <Alert
              icon={<IconAlertCircle size={20} />}
              title="Access Restricted"
              color="red"
              variant="light"
              radius="lg"
            >
              <Text size="md">
                This feature is only available for caregivers. Please log in with a caregiver account.
              </Text>
            </Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        paddingTop: "2rem",
        paddingBottom: "4rem",
      }}
    >
      <Container size="lg">
        <Paper
          p="md"
          radius="xl"
          shadow="xl"
          mb="xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Stack gap="xl">
            <Group justify="space-between" align="flex-start">
              <Stack gap="sm">
                <Group gap="sm" align="center">
                  <ThemeIcon size="xl" radius="xl" variant="gradient" gradient={{ from: "violet", to: "blue" }}>
                    <IconUsers size={24} />
                  </ThemeIcon>
                  <Title
                    order={1}
                    size="2rem"
                    fw={700}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Find Persons with Disabilities
                  </Title>
                </Group>
                <Text size="lg" c="dimmed" fw={400} style={{ maxWidth: "600px" }}>
                  Discover PWDs whose needs match your caregiving skills and connect to offer your support services.
                </Text>
              </Stack>
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={fetchDisabledSuggestions}
                loading={loading}
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
                size="lg"
                radius="xl"
              >
                Refresh Matches
              </Button>
            </Group>

            <Paper
              p="lg"
              radius="xl"
              style={{
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <Group gap="lg" align="center">
                <ThemeIcon size="xl" variant="gradient" gradient={{ from: "violet", to: "blue" }} radius="xl">
                  <IconUser size={24} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text fw={600} size="lg">
                    Your Caregiver Profile
                  </Text>
                  <Group gap="xl">
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed" fw={500}>
                        Your Skills
                      </Text>
                      <Text size="sm" fw={500}>
                        {caregiverTraits.length > 0 ? caregiverTraits.join(", ") : "Not specified"}
                      </Text>
                    </Stack>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed" fw={500}>
                        Target Disabilities
                      </Text>
                      <Text size="sm" fw={500}>
                        {targetDisabilities.length > 0 ? targetDisabilities.join(", ") : "None specified"}
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Group>
            </Paper>
          </Stack>
        </Paper>

        {!loading && (
          <Paper
            p="lg"
            radius="xl"
            shadow="md"
            mb="xl"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack gap="lg">
              <Group gap="md">
                <ThemeIcon variant="light" color="violet" size="lg" radius="xl">
                  <IconFilter size={20} />
                </ThemeIcon>
                <Text fw={600} size="lg">
                  Filter & Search
                </Text>
              </Group>

              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    radius="xl"
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <MultiSelect
                    placeholder="Filter by disabilities"
                    data={[
                      ...new Set(
                        disabledUsers
                          .flatMap((d) => Array.isArray(d.disabilities) ? d.disabilities : [])
                          .map((t) => (typeof t === "string" ? t.trim() : ""))
                          .filter((t) => t !== ""),
                      ),
                    ]}
                    value={selectedDisabilities}
                    onChange={setSelectedDisabilities}
                    searchable
                    clearable
                    radius="xl"
                    size="md"
                  />
                </Grid.Col>
              </Grid>

              <Alert
                icon={<IconInfoCircle size={18} />}
                title={`${totalFound} PWD users found`}
                color="blue"
                variant="light"
                radius="xl"
              >
                <Text size="sm">Use the filters above to find PWDs that match your caregiving expertise.</Text>
              </Alert>
            </Stack>
          </Paper>
        )}

        {/* Error Display */}
        {error && (
          <Paper p="lg" radius="xl" shadow="md" mb="xl" style={{ background: "rgba(255, 255, 255, 0.95)" }}>
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Something went wrong"
              color="red"
              variant="light"
              radius="xl"
            >
              <Text size="sm">{error}</Text>
            </Alert>
          </Paper>
        )}

        {/* Loading State */}
        {loading && (
          <Paper
            p="xl"
            radius="xl"
            shadow="xl"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Center py="xl">
              <Stack align="center" gap="lg">
                <Loader size="xl" color="violet" />
                <Text size="xl" fw={500}>
                  Finding matching PWD users...
                </Text>
                <Text c="dimmed" ta="center" size="md">
                  We're finding PWDs whose needs align with your caregiving skills
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}

        {!loading && disabledUsers.length > 0 && (
          <Grid gutter="xl">
            {disabledUsers
              .filter((d) => {
                const q = searchQuery.trim().toLowerCase();
                const matchesQuery =
                  q === "" ||
                  (d.username || "").toLowerCase().includes(q) ||
                  (d.address || "").toLowerCase().includes(q);
                const matchesDisabilities =
                  selectedDisabilities.length === 0 ||
                  selectedDisabilities.every((cond) =>
                    (Array.isArray(d.disabilities) ? d.disabilities : []).some(
                      (c) => (c || "").trim().toLowerCase() === (cond || "").trim().toLowerCase(),
                    ),
                  );
                return matchesQuery && matchesDisabilities;
              })
              .map((dUser, index) => (
                <Grid.Col
                  key={`${dUser.id || dUser.email || dUser.username || index}`}
                  span={{ base: 12, md: 6, lg: 4 }}
                >
                  <Card
                    shadow="xl"
                    padding="xl"
                    radius="xl"
                    withBorder={false}
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
                    }}
                  >
                    {/* Header with Avatar and Match Score */}
                    <Group justify="space-between" mb="lg" align="flex-start">
                      <Group gap="md" align="center">
                        <Avatar
                          src={dUser.profilePicture}
                          size="xl"
                          radius="xl"
                          style={{
                            border: "3px solid",
                            borderImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1",
                          }}
                        >
                          {dUser.username?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Stack gap="xs">
                          <Text fw={600} size="lg">
                            {dUser.username}
                          </Text>
                          <Badge variant="light" color="violet" radius="xl">
                            Person with Disability
                          </Badge>
                        </Stack>
                      </Group>
                      <Badge
                        color={getMatchColor(dUser.matchPercentage)}
                        variant="gradient"
                        gradient={{ from: getMatchColor(dUser.matchPercentage), to: "blue" }}
                        size="lg"
                        radius="xl"
                      >
                        {dUser.matchPercentage}% Match
                      </Badge>
                    </Group>

                    {/* Match Details */}
                    <Paper
                      p="md"
                      radius="xl"
                      mb="lg"
                      style={{
                        background: `linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)`,
                        border: "1px solid rgba(102, 126, 234, 0.2)",
                      }}
                    >
                      <Group justify="space-between" align="center">
                        <Stack gap="xs">
                          <Text size="sm" fw={600} c="violet">
                            {getMatchLabel(dUser.matchPercentage)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Matches {dUser.matchScore} of {targetDisabilities.length} target disabilities
                          </Text>
                        </Stack>
                        <ThemeIcon variant="light" color="violet" size="lg" radius="xl">
                          <IconStar size={18} />
                        </ThemeIcon>
                      </Group>
                    </Paper>

                    {/* Matching Disabilities */}
                    {dUser.matchingDisabilities && dUser.matchingDisabilities.length > 0 && (
                      <Stack gap="sm" mb="lg">
                        <Text size="sm" fw={600} c="teal">
                          ✓ Matching Needs
                        </Text>
                        <Group gap="xs">
                          {dUser.matchingDisabilities.map((disability, idx) => (
                            <Badge
                              key={idx}
                              size="sm"
                              variant="gradient"
                              gradient={{ from: "teal", to: "blue" }}
                              radius="xl"
                            >
                              {disability}
                            </Badge>
                          ))}
                        </Group>
                      </Stack>
                    )}

                    {/* Contact Information */}
                    <Stack gap="sm" mb="lg">
                      {dUser.phoneNumber && (
                        <Group gap="sm" align="center">
                          <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                            <IconPhone size={12} />
                          </ThemeIcon>
                          <Text size="sm" fw={500}>
                            {dUser.phoneNumber}
                          </Text>
                        </Group>
                      )}
                      {dUser.address && (
                        <Group gap="sm" align="center">
                          <ThemeIcon size="sm" variant="light" color="violet" radius="xl">
                            <IconMapPin size={12} />
                          </ThemeIcon>
                          <Text size="sm" fw={500} lineClamp={1}>
                            {dUser.address}
                          </Text>
                        </Group>
                      )}
                    </Stack>

                    {/* All Disabilities */}
                    <Stack gap="sm" mb="xl">
                      <Text size="sm" fw={600} c="gray.7">
                        All Disabilities & Needs
                      </Text>
                      <Group gap="xs">
                        {(() => {
                          const allDisabilities = (Array.isArray(dUser.disabilities) ? dUser.disabilities : [])
                            .map((t) => (typeof t === "string" ? t.trim() : ""))
                            .filter((t) => t !== "");
                          if (allDisabilities.length === 0) {
                            return (
                              <Text size="xs" c="dimmed" fs="italic">
                                No disabilities listed
                              </Text>
                            );
                          }
                          return allDisabilities.map((disability, idx) => (
                            <Badge
                              key={`${disability}-${idx}`}
                              size="sm"
                              variant={
                                Array.isArray(dUser.matchingDisabilities) &&
                                dUser.matchingDisabilities.includes(disability)
                                  ? "gradient"
                                  : "light"
                              }
                              gradient={
                                Array.isArray(dUser.matchingDisabilities) &&
                                dUser.matchingDisabilities.includes(disability)
                                  ? { from: "teal", to: "blue" }
                                  : undefined
                              }
                              color={
                                Array.isArray(dUser.matchingDisabilities) &&
                                dUser.matchingDisabilities.includes(disability)
                                  ? undefined
                                  : "gray"
                              }
                              radius="xl"
                            >
                              {disability}
                            </Badge>
                          ));
                        })()}
                      </Group>
                    </Stack>

                    {/* Action Buttons */}
                    <Group gap="sm">
                      <Button
                        flex={1}
                        leftSection={<IconMail size={16} />}
                        onClick={() => handleContact(dUser)}
                        variant="gradient"
                        gradient={{ from: "violet", to: "blue" }}
                        radius="xl"
                        size="md"
                      >
                        Contact Now
                      </Button>
                      <Tooltip label="Save to favorites" position="top">
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="lg"
                          radius="xl"
                          style={{ transition: "all 0.2s ease" }}
                        >
                          <IconHeart size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && disabledUsers.length === 0 && !error && (
          <Paper
            p="xl"
            radius="xl"
            shadow="xl"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Center py="xl">
              <Stack align="center" gap="lg" style={{ maxWidth: "500px" }}>
                <ThemeIcon size="4rem" variant="light" color="violet" radius="xl">
                  <IconUsers size={48} />
                </ThemeIcon>
                <Text size="xl" fw={600} ta="center">
                  No matching PWD users found
                </Text>
                <Text c="dimmed" ta="center" size="md">
                  We couldn't find PWDs whose needs match your caregiving skills right now. Try updating your profile
                  with more detailed skills or check back later.
                </Text>
                <Button
                  variant="gradient"
                  gradient={{ from: "violet", to: "blue" }}
                  size="lg"
                  radius="xl"
                  onClick={() => navigate("/profile")}
                >
                  Update My Profile
                </Button>
              </Stack>
            </Center>
          </Paper>
        )}

        <Modal
          opened={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          title={
            <Group gap="sm" align="center">
              <ThemeIcon variant="gradient" gradient={{ from: "violet", to: "blue" }} radius="xl">
                <IconMail size={18} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Contact {selectedUser?.username}
              </Text>
            </Group>
          }
          size="md"
          radius="xl"
          overlayProps={{ blur: 10 }}
        >
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              Send a personalized message to {selectedUser?.username} about your caregiving services. They'll receive
              your contact information and can reach out to discuss their needs.
            </Text>

            <TextInput
              label="Your Name"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
              radius="lg"
            />

            <TextInput
              label="Your Email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
              radius="lg"
            />

            <TextInput
              label="Your Phone (optional)"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              radius="lg"
            />

            <Textarea
              label="Message"
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              rows={4}
              required
              radius="lg"
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="light" onClick={() => setContactModalOpen(false)} radius="xl">
                Cancel
              </Button>
              <Button
                onClick={handleContactSubmit}
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
                radius="xl"
              >
                Send Message
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </Box>
  );
}