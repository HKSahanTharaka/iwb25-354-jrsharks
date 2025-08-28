"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api.js';


export default function FindCare() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDisabilities, setUserDisabilities] = useState([]);
  const [requiredTraits, setRequiredTraits] = useState([]);
  const [totalFound, setTotalFound] = useState(0);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraits, setSelectedTraits] = useState([]);

  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Check if user is logged in and is a PWD
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role?.toLowerCase() !== "pwd") {
      setError("This feature is only available for persons with disabilities.");
      return;
    }

    // Load caregiver suggestions on component mount
    fetchCaregiverSuggestions();
  }, [user, navigate]);

  const fetchCaregiverSuggestions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl('caregivers/suggest'), {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch caregiver suggestions"
        );
      }

      const data = await response.json();
      const rawCaregivers = Array.isArray(data.suggestedCaregivers)
        ? data.suggestedCaregivers
        : [];
      const disabilities = Array.isArray(data.userDisabilities)
        ? data.userDisabilities
        : [];
      const traits = Array.isArray(data.requiredTraits)
        ? data.requiredTraits
        : [];

      // Compute matches client-side; do NOT auto-filter or auto-sort
      const filtered = rawCaregivers.map((cg) => {
        // Normalize traits from backend (supports array, string, or stringified JSON)
        const rawTraits =
          (cg && (cg.traits ?? cg.skills ?? cg.caregiverTraits)) ?? [];
        let caregiverTraits = [];
        if (Array.isArray(rawTraits)) {
          caregiverTraits = rawTraits.filter((t) => typeof t === "string");
        } else if (typeof rawTraits === "string") {
          const trimmed = rawTraits.trim();
          if (
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            (trimmed.startsWith('"[') && trimmed.endsWith(']"'))
          ) {
            try {
              const parsed = JSON.parse(trimmed.replace(/^"|"$/g, ""));
              if (Array.isArray(parsed)) {
                caregiverTraits = parsed.filter((t) => typeof t === "string");
              } else {
                caregiverTraits = [rawTraits];
              }
            } catch {
              caregiverTraits = [rawTraits];
            }
          } else {
            caregiverTraits = [rawTraits];
          }
        }
        const matchingTraits = traits.filter((t) =>
          caregiverTraits.some(
            (ct) =>
              (ct || "").trim().toLowerCase() === (t || "").trim().toLowerCase()
          )
        );
        const matchScore = matchingTraits.length;
        const matchPercentage =
          traits.length > 0
            ? Math.floor((matchScore * 100) / traits.length)
            : 0;
        return {
          ...cg,
          traits: caregiverTraits,
          matchingTraits,
          matchScore,
          matchPercentage,
        };
      });

      // Debug: Inspect traits after normalization
      try {
        console.debug("Caregivers (sample):", filtered.slice(0, 3));
      } catch {}
      setCaregivers(filtered);
      setUserDisabilities(disabilities);
      setRequiredTraits(traits);
      setTotalFound(filtered.length);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching caregivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactCaregiver = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setContactForm({
      name: user?.username || "",
      email: user?.email || "",
      phone: "",
      message: `Hello ${
        caregiver.username
      }, I'm interested in your caregiving services. I have the following disabilities: ${userDisabilities.join(
        ", "
      )}. Please contact me to discuss how you can help.`,
    });
    setContactModalOpen(true);
  };

  const handleContactSubmit = async () => {
    // In a real application, this would send the contact request
    // For now, we'll just show a success message
    alert(
      `Contact request sent to ${selectedCaregiver?.username}! They will receive your message and contact you soon.`
    );
    setContactModalOpen(false);
    setSelectedCaregiver(null);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "teal";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "yellow";
    return "orange";
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Basic Match";
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
        <Paper
          p="xl"
          radius="xl"
          shadow="xl"
          style={{ background: "rgba(255, 255, 255, 0.95)" }}
        >
          <Center>
            <Stack align="center" gap="md">
              <Loader size="xl" color="violet" />
              <Text size="lg" fw={500}>
                Loading your caregiver matches...
              </Text>
            </Stack>
          </Center>
        </Paper>
      </Box>
    );
  }

  if (user.role?.toLowerCase() !== "pwd") {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "2rem 0",
        }}
      >
        <Container size="lg">
          <Paper
            p="xl"
            radius="xl"
            shadow="xl"
            style={{ background: "rgba(255, 255, 255, 0.95)" }}
          >
            <Alert
              icon={<IconAlertCircle size={20} />}
              title="Access Restricted"
              color="red"
              variant="light"
              radius="lg"
            >
              <Text size="md">
                This feature is only available for persons with disabilities.
                Please log in with a PWD account.
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
                  <ThemeIcon
                    size="xl"
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: "violet", to: "blue" }}
                  >
                    <IconSearch size={24} />
                  </ThemeIcon>
                  <Title
                    order={1}
                    size="2rem"
                    fw={700}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Find Your Perfect Caregiver
                  </Title>
                </Group>
                <Text
                  size="lg"
                  c="dimmed"
                  fw={400}
                  style={{ maxWidth: "600px" }}
                >
                  Connect with qualified, compassionate caregivers who
                  understand your unique needs and can provide personalized
                  support.
                </Text>
              </Stack>
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={fetchCaregiverSuggestions}
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
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <Group gap="lg" align="center">
                <ThemeIcon
                  size="xl"
                  variant="gradient"
                  gradient={{ from: "violet", to: "blue" }}
                  radius="xl"
                >
                  <IconUser size={24} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text fw={600} size="lg">
                    Your Care Profile
                  </Text>
                  <Group gap="xl">
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed" fw={500}>
                        Disabilities
                      </Text>
                      <Text size="sm" fw={500}>
                        {userDisabilities.length > 0
                          ? userDisabilities.join(", ")
                          : "Not specified"}
                      </Text>
                    </Stack>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed" fw={500}>
                        Required Skills
                      </Text>
                      <Text size="sm" fw={500}>
                        {requiredTraits.length > 0
                          ? requiredTraits.join(", ")
                          : "None specified"}
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
                    placeholder="Filter by caregiver skills"
                    data={[
                      ...new Set(
                        caregivers
                          .flatMap((c) => {
                            const source =
                              Array.isArray(c.traits) && c.traits.length > 0
                                ? c.traits
                                : Array.isArray(c.skills) && c.skills.length > 0
                                ? c.skills
                                : Array.isArray(c.caregiverTraits) &&
                                  c.caregiverTraits.length > 0
                                ? c.caregiverTraits
                                : [];
                            return source;
                          })
                          .map((t) => (typeof t === "string" ? t.trim() : ""))
                          .filter((t) => t !== "")
                      ),
                    ]}
                    value={selectedTraits}
                    onChange={setSelectedTraits}
                    searchable
                    clearable
                    radius="xl"
                    size="md"
                  />
                </Grid.Col>
              </Grid>

              <Alert
                icon={<IconInfoCircle size={18} />}
                title={`${totalFound} caregivers found`}
                color="blue"
                variant="light"
                radius="xl"
              >
                <Text size="sm">
                  Use the filters above to find caregivers that match your
                  specific needs.
                </Text>
              </Alert>
            </Stack>
          </Paper>
        )}

        {/* Error Display */}
        {error && (
          <Paper
            p="lg"
            radius="xl"
            shadow="md"
            mb="xl"
            style={{ background: "rgba(255, 255, 255, 0.95)" }}
          >
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
                  Finding your perfect caregivers...
                </Text>
                <Text c="dimmed" ta="center" size="md">
                  We're matching you with qualified caregivers based on your
                  specific needs
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}

       {!loading && caregivers.length > 0 && (
  <Grid gutter="xl">
    {caregivers
      .filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          q === "" ||
          (c.username || "").toLowerCase().includes(q) ||
          (c.address || "").toLowerCase().includes(q);
        const matchesTraits =
          selectedTraits.length === 0 ||
          selectedTraits.every((t) =>
            (Array.isArray(c.traits) ? c.traits : []).some(
              (ct) =>
                (ct || "").trim().toLowerCase() ===
                (t || "").trim().toLowerCase()
            )
          );
        return matchesQuery && matchesTraits;
      })
      .map((caregiver, index) => (
        <Grid.Col
          key={`${
            caregiver.id ||
            caregiver.email ||
            caregiver.username ||
            index
          }`}
          span={{ base: 12, md: 6, lg: 4 }}
          style={{ display: "flex" }} // 👈 flex column
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
              minHeight: "100%", // 👈 stretch to col height
              flex: 1, // 👈 fill space
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(0,0,0,0.1)";
            }}
          >
            {/* Header with Avatar and Match Score */}
            <Group justify="space-between" mb="lg" align="flex-start">
              <Group gap="md" align="center">
                <div
                  style={{
                    display: "inline-flex",
                    padding: "3px", // thickness of border
                    borderRadius: "50%", // makes it round
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <Avatar
                    src={caregiver.profilePicture}
                    size="xl"
                    radius="xl"
                    style={{
                      borderRadius: "50%", // ensure inner stays round
                      backgroundColor: "white", // fallback if no image
                    }}
                  >
                    {caregiver.username.charAt(0).toUpperCase()}
                  </Avatar>
                </div>

                <Stack gap="xs">
                  <Text fw={600} size="lg">
                    {caregiver.username}
                  </Text>
                  <Badge variant="light" color="violet" radius="xl">
                    Professional Caregiver
                  </Badge>
                </Stack>
              </Group>
              <Badge
                color={getMatchColor(caregiver.matchPercentage)}
                variant="gradient"
                gradient={{
                  from: getMatchColor(caregiver.matchPercentage),
                  to: "blue",
                }}
                size="lg"
                radius="xl"
              >
                {caregiver.matchPercentage}% Match
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
                    {getMatchLabel(caregiver.matchPercentage)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Matches {caregiver.matchScore} of{" "}
                    {requiredTraits.length} required skills
                  </Text>
                </Stack>
                <ThemeIcon
                  variant="light"
                  color="violet"
                  size="lg"
                  radius="xl"
                >
                  <IconStar size={18} />
                </ThemeIcon>
              </Group>
            </Paper>

            {/* Matching Traits */}
            {caregiver.matchingTraits.length > 0 && (
              <Stack gap="sm" mb="lg">
                <Text size="sm" fw={600} c="teal">
                  ✓ Matching Skills
                </Text>
                <Group gap="xs">
                  {caregiver.matchingTraits.map((trait, idx) => (
                    <Badge
                      key={idx}
                      size="sm"
                      variant="gradient"
                      gradient={{ from: "teal", to: "blue" }}
                      radius="xl"
                    >
                      {trait}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            )}

            {/* Contact Information */}
            <Stack gap="sm" mb="lg">
              {caregiver.phoneNumber && (
                <Group gap="sm" align="center">
                  <ThemeIcon
                    size="sm"
                    variant="light"
                    color="blue"
                    radius="xl"
                  >
                    <IconPhone size={12} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    {caregiver.phoneNumber}
                  </Text>
                </Group>
              )}
              {caregiver.address && (
                <Group gap="sm" align="center">
                  <ThemeIcon
                    size="sm"
                    variant="light"
                    color="violet"
                    radius="xl"
                  >
                    <IconMapPin size={12} />
                  </ThemeIcon>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {caregiver.address}
                  </Text>
                </Group>
              )}
            </Stack>

            {/* All Skills */}
            <Stack gap="sm" mb="xl">
              <Text size="sm" fw={600} c="gray.7">
                All Skills & Expertise
              </Text>
              <Group gap="xs">
                {(() => {
                  const raw =
                    Array.isArray(caregiver.traits) &&
                    caregiver.traits.length > 0
                      ? caregiver.traits
                      : Array.isArray(caregiver.skills) &&
                        caregiver.skills.length > 0
                      ? caregiver.skills
                      : Array.isArray(caregiver.caregiverTraits) &&
                        caregiver.caregiverTraits.length > 0
                      ? caregiver.caregiverTraits
                      : [];
                  const skills = raw
                    .map((t) => (typeof t === "string" ? t.trim() : ""))
                    .filter((t) => t !== "");
                  if (skills.length === 0) {
                    return (
                      <Text size="xs" c="dimmed" fs="italic">
                        No skills listed
                      </Text>
                    );
                  }
                  return skills.map((trait, idx) => (
                    <Badge
                      key={`${trait}-${idx}`}
                      size="sm"
                      variant={
                        Array.isArray(caregiver.matchingTraits) &&
                        caregiver.matchingTraits.includes(trait)
                          ? "gradient"
                          : "light"
                      }
                      gradient={
                        Array.isArray(caregiver.matchingTraits) &&
                        caregiver.matchingTraits.includes(trait)
                          ? { from: "teal", to: "blue" }
                          : undefined
                      }
                      color={
                        Array.isArray(caregiver.matchingTraits) &&
                        caregiver.matchingTraits.includes(trait)
                          ? undefined
                          : "gray"
                      }
                      radius="xl"
                    >
                      {trait}
                    </Badge>
                  ));
                })()}
              </Group>
            </Stack>

            {/* Action Buttons (stick to bottom) */}
            <Group gap="sm" mt="auto">
              <Button
                flex={1}
                leftSection={<IconMail size={16} />}
                onClick={() => handleContactCaregiver(caregiver)}
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
                radius="xl"
                size="md"
              >
                Contact Now
              </Button>
              {/* <Tooltip label="Save to favorites" position="top">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  radius="xl"
                  style={{ transition: "all 0.2s ease" }}
                >
                  <IconHeart size={18} />
                </ActionIcon>
              </Tooltip> */}
            </Group>
          </Card>
        </Grid.Col>
      ))}
  </Grid>
)}


        {/* No Results */}
        {!loading && caregivers.length === 0 && !error && (
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
                <ThemeIcon
                  size="4rem"
                  variant="light"
                  color="violet"
                  radius="xl"
                >
                  <IconUsers size={48} />
                </ThemeIcon>
                <Text size="xl" fw={600} ta="center">
                  No matching caregivers found
                </Text>
                <Text c="dimmed" ta="center" size="md">
                  We couldn't find caregivers that match your specific needs
                  right now. Try updating your profile with more detailed
                  information or check back later.
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
              <ThemeIcon
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
                radius="xl"
              >
                <IconMail size={18} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Contact {selectedCaregiver?.username}
              </Text>
            </Group>
          }
          size="md"
          radius="xl"
          overlayProps={{ blur: 10 }}
        >
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              Send a personalized message to {selectedCaregiver?.username} about
              your caregiving needs. They'll receive your contact information
              and can reach out to discuss how they can help.
            </Text>

            <TextInput
              label="Your Name"
              value={contactForm.name}
              onChange={(e) =>
                setContactForm({ ...contactForm, name: e.target.value })
              }
              required
              radius="lg"
            />

            <TextInput
              label="Your Email"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
              required
              radius="lg"
            />

            <TextInput
              label="Your Phone (optional)"
              value={contactForm.phone}
              onChange={(e) =>
                setContactForm({ ...contactForm, phone: e.target.value })
              }
              radius="lg"
            />

            <Textarea
              label="Message"
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              rows={4}
              required
              radius="lg"
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="light"
                onClick={() => setContactModalOpen(false)}
                radius="xl"
              >
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
