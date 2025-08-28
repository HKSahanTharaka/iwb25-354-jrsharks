"use client";

// src/pages/UserProfile.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  Avatar,
  Badge,
  Card,
  SimpleGrid,
  ActionIcon,
  FileInput,
  Tabs,
  Box,
  Progress,
  ThemeIcon,
  Flex,
  Modal,
  PasswordInput,
  Alert,
} from "@mantine/core";
import {
  IconUser,
  IconPhone,
  IconMapPin,
  IconLock,
  IconTrash,
  IconEdit,
  IconCamera,
  IconActivity,
  IconShield,
  IconAlertTriangle,
  IconMail,
  IconUserCheck,
  IconStar,
  IconMapPinFilled,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { buildApiUrl } from "../config/api.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

function UserProfile() {
  const { user, token, loading: authLoading, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Profile form
  const profileForm = useForm({
    initialValues: {
      username: "",
      phoneNumber: "",
      address: "",
      profilePicture: "",
    },
  });

  // Password form
  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      newPassword: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      console.log(
        "Fetching profile with token:",
        token ? "Token exists" : "No token"
      );

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(buildApiUrl("profile"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Profile response status:", response.status);

      if (response.status === 401) {
        setAuthError(
          "Authentication failed. Please try again or log in again."
        );
        setProfile(null);
        return;
      }

      if (response.ok) {
        const profileData = await response.json();
        console.log("Profile data received:", profileData);
        setProfile(profileData);
        profileForm.setValues({
          username: profileData.username || "",
          phoneNumber: profileData.phoneNumber || "",
          address: profileData.address || "",
          profilePicture: profileData.profilePicture || "",
        });
      } else {
        const errorText = await response.text();
        console.error("Profile fetch error response:", errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setAuthError(error.message || "Failed to load profile data");

      notifications?.show?.({
        title: "Error",
        message: error.message || "Failed to load profile data",
        color: "red",
      });
    }
  };

  // Fetch activity data
  const fetchActivity = async () => {
    try {
      console.log(
        "Fetching activity with token:",
        token ? "Token exists" : "No token"
      );

      if (!token) {
        console.log("No token available for activity fetch");
        setActivity({ placesAdded: [] }); // Set empty activity
        return;
      }

      const response = await fetch(buildApiUrl("profile/activity"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Activity response status:", response.status);

      if (response.status === 401) {
        console.log("Activity fetch unauthorized - token may be invalid");
        setActivity({ placesAdded: [] }); // Set empty activity
        return;
      }

      if (response.ok) {
        const activityData = await response.json();
        console.log("Activity data received:", activityData);
        setActivity(activityData);
      } else {
        const errorText = await response.text();
        console.error("Activity fetch error response:", errorText);
        setActivity({ placesAdded: [] }); // Set empty activity on error
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      setActivity({ placesAdded: [] }); // Set empty activity on error
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        console.log("UserProfile: Auth still loading, waiting...");
        return;
      }

      setLoading(true);

      // Check if we have user and token from AuthContext
      console.log("UserProfile useEffect - User:", user);
      console.log(
        "UserProfile useEffect - Token:",
        token ? "Present" : "Missing"
      );
      console.log("UserProfile useEffect - Auth state:", {
        hasUser: !!user,
        hasToken: !!token,
        userEmail: user?.email,
        userRole: user?.role,
        authLoading,
      });

      if (!token || !user) {
        console.log("Missing authentication - cannot load profile");
        setAuthError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        await Promise.all([fetchProfile(), fetchActivity()]);
      } catch (error) {
        console.error("Error loading profile data:", error);
      }

      setLoading(false);
    };

    loadData();
  }, [token, user, authLoading]);

  // Handle profile update
  const handleProfileUpdate = async (values) => {
    try {
      const response = await fetch(buildApiUrl('profile'), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        await fetchProfile();
        setEditMode(false);
        notifications?.show?.({
          title: "Success",
          message: "Profile updated successfully",
          color: "green",
        });

        // Update user context if username or profile picture changed
        const updatedUserData = {};
        if (values.username && values.username !== user.username) {
          updatedUserData.username = values.username;
        }
        if (
          values.profilePicture &&
          values.profilePicture !== user.profilePicture
        ) {
          updatedUserData.profilePicture = values.profilePicture;
        }
        if (Object.keys(updatedUserData).length > 0) {
          setUser({ ...user, ...updatedUserData });
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notifications?.show?.({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    try {
      const response = await fetch(buildApiUrl('profile/password'), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordModalOpen(false);
        passwordForm.reset();
        notifications?.show?.({
          title: "Success",
          message: "Password changed successfully",
          color: "green",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      notifications?.show?.({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(buildApiUrl('profile'), {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        logout();
        navigate("/login");
        notifications?.show?.({
          title: "Account Deleted",
          message: "Your account has been permanently deleted",
          color: "red",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      notifications?.show?.({
        title: "Error",
        message: error.message || "Failed to delete account",
        color: "red",
      });
    }
  };

  // Handle profile picture upload
  const handleFileSelect = (file) => {
    setSelectedFile(file);

    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Add this function to confirm and upload the selected image
  const handleConfirmUpload = async () => {
    if (selectedFile) {
      await handleProfilePictureUpload(selectedFile);
      // Reset the selection after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Your existing handleProfilePictureUpload function (keep this as is):
  const handleProfilePictureUpload = async (file) => {
    if (!file) return;

    // Helper to read as base64 data URL
    const readFileAsDataURL = (f) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);

      const res = await fetch(buildApiUrl('profile/upload'), {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file: dataUrl,
          fileName: file.name || "profile.jpg",
        }),
      });

      const contentType = res.headers.get("content-type");
      const payload =
        contentType && contentType.includes("application/json")
          ? await res.json()
          : await res.text();

      if (!res.ok) {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.error || "Upload failed";
        throw new Error(msg);
      }

      const imageUrl = payload?.url || payload?.secure_url || "";
      if (!imageUrl) {
        throw new Error("Upload succeeded but no URL returned");
      }

      // Update UI state
      setProfile((prev) => ({ ...(prev || {}), profilePicture: imageUrl }));
      profileForm.setFieldValue("profilePicture", imageUrl);

      // Update user context so header shows the new profile picture immediately
      setUser((prev) => ({ ...(prev || {}), profilePicture: imageUrl }));

      notifications?.show?.({
        title: "Profile picture updated",
        message: "Your profile picture has been uploaded successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      notifications?.show?.({
        title: "Error",
        message: error.message || "Failed to upload profile picture",
        color: "red",
      });
    } finally {
      setUploading(false);
    }
  };

  // Add this function to cancel the selection
  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Render loading state
  if (loading || authLoading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f0ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container size="sm">
          <Paper
            withBorder
            shadow="xl"
            p="xl"
            radius="xl"
            bg="white"
            ta="center"
          >
            <ThemeIcon
              size="xl"
              radius="lg"
              variant="light"
              color="violet"
              mb="lg"
              mx="auto"
            >
              <IconUser size={32} />
            </ThemeIcon>
            <Title order={2} size="h3" fw={600} mb="md" c="dark">
              Loading Your Profile
            </Title>
            <Progress
              value={75}
              size="lg"
              radius="xl"
              color="violet"
              animated
            />
            <Text size="sm" c="dimmed" mt="md">
              Preparing your AccessAble experience...
            </Text>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Render error state
  if (authError && !profile) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f0ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container size="sm">
          <Paper
            withBorder
            shadow="xl"
            p="xl"
            radius="xl"
            bg="white"
            ta="center"
          >
            <ThemeIcon
              size="xl"
              radius="lg"
              variant="light"
              color="red"
              mb="lg"
              mx="auto"
            >
              <IconAlertTriangle size={32} />
            </ThemeIcon>
            <Title order={2} size="h3" fw={600} mb="md" c="dark">
              Authentication Required
            </Title>
            <Text size="md" c="dimmed" mb="xl">
              {authError}
            </Text>
            <Group justify="center" gap="md">
              <Button
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
                size="md"
                radius="xl"
                onClick={() => navigate("/login")}
              >
                Sign In Again
              </Button>
              <Button
                variant="outline"
                color="violet"
                size="md"
                radius="xl"
                onClick={() => navigate("/")}
              >
                Go Home
              </Button>
            </Group>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #667eea 0%, #764ba2 50%, #f3f0ff 50%, #f3f0ff 100%)",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <Container size="md">
        <Paper withBorder shadow="xl" p="md" radius="xl" bg="white" mb="xl">
          <Group justify="space-between" align="center">
            <Group gap="lg">
              <Avatar
                src={profile?.profilePicture}
                size="xl"
                radius="xl"
                style={{ border: "3px solid #9775fa" }}
              >
                <IconUser size={32} />
              </Avatar>
              <Box>
                <Title order={1} size="h2" fw={700} c="dark" mb="xs">
                  Welcome back, {profile?.username || "User"}!
                </Title>
                <Text size="lg" c="dimmed" fw={500}>
                  Managing your AccessAble Sri Lanka profile
                </Text>
                <Badge
                  variant="gradient"
                  gradient={{ from: "violet", to: "blue" }}
                  size="lg"
                  radius="xl"
                  mt="sm"
                >
                  {profile?.role === "pwd"
                    ? "Person with Disability"
                    : profile?.role === "caregiver"
                    ? "Caregiver"
                    : profile?.role}
                </Badge>
              </Box>
            </Group>
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => setEditMode(!editMode)}
              variant="gradient"
              gradient={{ from: "violet", to: "blue" }}
              size="lg"
              radius="xl"
            >
              {editMode ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </Group>
        </Paper>

        <Tabs defaultValue="profile" variant="pills" radius="xl">
          <Tabs.List
            grow
            mb="xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "1rem",
              padding: "0.5rem",
            }}
          >
            <Tabs.Tab
              value="profile"
              leftSection={<IconUser size={16} />}
              style={{ borderRadius: "0.75rem", fontWeight: 600, gap: "0" }}
            >
              Profile Information
            </Tabs.Tab>
            <Tabs.Tab
              value="security"
              leftSection={<IconShield size={16} />}
              style={{ borderRadius: "0.75rem", fontWeight: 600, gap: "0" }}
            >
              Security Settings
            </Tabs.Tab>
            <Tabs.Tab
              value="activity"
              leftSection={<IconActivity size={16} />}
              style={{ borderRadius: "0.75rem", fontWeight: 600, gap: "0" }}
            >
              Activity Overview
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" pt="xl">
            <Paper withBorder shadow="xl" p="md" radius="xl" bg="white">
              <Stack gap="lg">
                {/* Profile Picture Section */}
                <Card
                  withBorder
                  p="md"
                  radius="xl"
                  bg="rgba(151, 117, 250, 0.05)"
                >
                  <Group justify="center" mb="lg">
                    <Box pos="relative">
                      <Avatar
                        src={previewUrl || profile?.profilePicture}
                        size={120}
                        radius="xl"
                        style={{
                          border: "4px solid #9775fa",
                          opacity: previewUrl ? 0.8 : 1,
                        }}
                      >
                        <IconUser size={48} />
                      </Avatar>
                      {previewUrl && (
                        <Badge
                          size="sm"
                          variant="filled"
                          color="blue"
                          pos="absolute"
                          top={-5}
                          right={-5}
                          radius="xl"
                        >
                          Preview
                        </Badge>
                      )}
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: "violet", to: "blue" }}
                        pos="absolute"
                        bottom={0}
                        right={0}
                        style={{ border: "3px solid white" }}
                        loading={uploading}
                        onClick={() =>
                          document
                            .getElementById("profile-picture-input")
                            .click()
                        }
                      >
                        <IconCamera size={16} />
                      </ActionIcon>
                    </Box>
                  </Group>

                  <Text ta="center" size="lg" fw={600} c="dark" mb="xs">
                    Profile Picture
                  </Text>
                  <Text ta="center" size="sm" c="dimmed" mb="lg">
                    {selectedFile
                      ? "Preview your new profile picture below"
                      : "Upload a photo to personalize your AccessAble profile"}
                  </Text>

                  <Group justify="center">
                    <FileInput
                      id="profile-picture-input"
                      placeholder="Choose new photo"
                      accept="image/*"
                      leftSection={<IconCamera size={16} />}
                      radius="xl"
                      style={{
                        maxWidth: "200px",
                        display: selectedFile ? "none" : "block",
                      }}
                      onChange={handleFileSelect}
                      value={selectedFile}
                    />

                    {selectedFile && (
                      <Group gap="sm">
                        <Button
                          leftSection={<IconCamera size={16} />}
                          onClick={handleConfirmUpload}
                          variant="gradient"
                          gradient={{ from: "violet", to: "blue" }}
                          size="sm"
                          radius="xl"
                          loading={uploading}
                        >
                          Upload Photo
                        </Button>
                        <Button
                          variant="outline"
                          color="gray"
                          size="sm"
                          radius="xl"
                          onClick={handleCancelUpload}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          radius="xl"
                          onClick={() =>
                            document
                              .getElementById("profile-picture-input")
                              .click()
                          }
                        >
                          Choose Different
                        </Button>
                      </Group>
                    )}
                  </Group>

                  {selectedFile && (
                    <Text ta="center" size="xs" c="dimmed" mt="sm">
                      Selected: {selectedFile.name}
                    </Text>
                  )}
                </Card>

                {/* Profile Information */}
                {editMode ? (
                  <form onSubmit={profileForm.onSubmit(handleProfileUpdate)}>
                    <Stack gap="lg">
                      <SimpleGrid cols={2} spacing="lg">
                        <TextInput
                          label="Full Name"
                          placeholder="Enter your full name"
                          leftSection={<IconUser size={16} />}
                          radius="lg"
                          size="md"
                          styles={{
                            input: {
                              textAlign: "center",
                            },
                          }}
                          {...profileForm.getInputProps("username")}
                        />
                        <TextInput
                          label="Phone Number"
                          placeholder="Enter your phone number"
                          leftSection={<IconPhone size={16} />}
                          radius="lg"
                          size="md"
                          styles={{
                            input: {
                              textAlign: "center",
                            },
                          }}
                          {...profileForm.getInputProps("phoneNumber")}
                        />
                      </SimpleGrid>
                      <TextInput
                        label="Address"
                        placeholder="Enter your address"
                        leftSection={<IconMapPin size={16} />}
                        radius="lg"
                        size="md"
                        styles={{
                          input: {
                            textAlign: "center",
                          },
                        }}
                        {...profileForm.getInputProps("address")}
                      />
                      <Group justify="flex-end" gap="md">
                        <Button
                          variant="outline"
                          color="gray"
                          onClick={() => setEditMode(false)}
                          radius="xl"
                          size="md"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="gradient"
                          gradient={{ from: "violet", to: "blue" }}
                          radius="xl"
                          size="md"
                        >
                          Save Changes
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                ) : (
                  <SimpleGrid cols={2} spacing="lg">
                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(151, 117, 250, 0.05)"
                    >
                      <Group gap="md" mb="sm">
                        <ThemeIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          color="violet"
                        >
                          <IconUser size={18} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed" fw={500}>
                          Full Name
                        </Text>
                      </Group>
                      <Text size="lg" fw={600} c="dark" pl="md">
                        {profile.username || "Not set"}
                      </Text>
                    </Card>

                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(76, 110, 245, 0.05)"
                    >
                      <Group gap="md" mb="sm">
                        <ThemeIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          color="blue"
                        >
                          <IconMail size={18} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed" fw={500}>
                          Email Address
                        </Text>
                      </Group>
                      <Text size="lg" fw={600} c="dark" pl="md">
                        {profile.email}
                      </Text>
                    </Card>

                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(34, 197, 94, 0.05)"
                    >
                      <Group gap="md" mb="sm">
                        <ThemeIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          color="green"
                        >
                          <IconPhone size={18} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed" fw={500}>
                          Phone Number
                        </Text>
                      </Group>
                      <Text size="lg" fw={600} c="dark" pl="md">
                        {profile.phoneNumber || "Not set"}
                      </Text>
                    </Card>

                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(151, 117, 250, 0.05)"
                    >
                      <Group gap="md" mb="sm">
                        <ThemeIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          color="violet"
                        >
                          <IconUserCheck size={18} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed" fw={500}>
                          Account Type
                        </Text>
                      </Group>
                      <Badge
                        variant="gradient"
                        gradient={{ from: "violet", to: "blue" }}
                        size="lg"
                        radius="xl"
                      >
                        {profile.role === "pwd"
                          ? "Person with Disability"
                          : profile.role === "caregiver"
                          ? "Caregiver"
                          : profile.role}
                      </Badge>
                    </Card>

                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(239, 68, 68, 0.05)"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <Group gap="md" mb="sm">
                        <ThemeIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          color="red"
                        >
                          <IconMapPinFilled size={18} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed" fw={500}>
                          Address
                        </Text>
                      </Group>
                      <Text size="lg" fw={600} c="dark" pl="md">
                        {profile.address || "Not set"}
                      </Text>
                    </Card>
                  </SimpleGrid>
                )}

                {(profile.disabilities?.length > 0 ||
                  profile.traits?.length > 0) && (
                  <Card
                    withBorder
                    p="md"
                    radius="xl"
                    bg="rgba(151, 117, 250, 0.05)"
                  >
                    <Stack gap="lg">
                      {profile.disabilities &&
                        profile.disabilities.length > 0 && (
                          <Box>
                            <Text size="md" fw={600} mb="md" c="dark">
                              Accessibility Needs
                            </Text>
                            <Group gap="sm">
                              {profile.disabilities.map((disability, index) => (
                                <Badge
                                  key={index}
                                  variant="gradient"
                                  gradient={{ from: "orange", to: "red" }}
                                  size="lg"
                                  radius="xl"
                                >
                                  {disability}
                                </Badge>
                              ))}
                            </Group>
                          </Box>
                        )}

                      {profile.traits && profile.traits.length > 0 && (
                        <Box>
                          <Text size="md" fw={600} mb="md" c="dark">
                            Helpful Traits
                          </Text>
                          <Group gap="sm">
                            {profile.traits.map((trait, index) => (
                              <Badge
                                key={index}
                                variant="gradient"
                                gradient={{ from: "green", to: "teal" }}
                                size="lg"
                                radius="xl"
                              >
                                {trait}
                              </Badge>
                            ))}
                          </Group>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="security" pt="xl">
            <Paper withBorder shadow="xl" p="md" radius="xl" bg="white">
              <Title order={2} size="h3" fw={600} mb="xl" c="dark">
                Security & Account Settings
              </Title>

              <Stack gap="lg">
                <Card
                  withBorder
                  p="md"
                  radius="xl"
                  bg="rgba(255, 255, 255, 0.95)"
                >
                  <Group justify="space-between" align="center">
                    <Flex align="center" gap="lg">
                      <ThemeIcon
                        variant="light"
                        size="xl"
                        radius="xl"
                        color="blue"
                      >
                        <IconLock size={24} />
                      </ThemeIcon>
                      <Box>
                        <Text size="lg" fw={600} c="dark">
                          Password Security
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          Keep your AccessAble account secure with a strong
                          password
                        </Text>
                      </Box>
                    </Flex>
                    <Button
                      leftSection={<IconLock size={16} />}
                      onClick={() => setPasswordModalOpen(true)}
                      variant="gradient"
                      gradient={{ from: "blue", to: "violet" }}
                      size="md"
                      radius="xl"
                    >
                      Change Password
                    </Button>
                  </Group>
                </Card>

                <Card
                  withBorder
                  p="md"
                  radius="xl"
                  bg="rgba(255, 255, 255, 0.95)"
                  style={{ borderColor: "var(--mantine-color-red-3)" }}
                >
                  <Group justify="space-between" align="center">
                    <Flex align="center" gap="lg">
                      <ThemeIcon
                        variant="light"
                        size="xl"
                        radius="xl"
                        color="red"
                      >
                        <IconAlertTriangle size={24} />
                      </ThemeIcon>
                      <Box>
                        <Text size="lg" fw={600} c="red.7">
                          Danger Zone
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          Permanently delete your AccessAble account and all
                          data
                        </Text>
                      </Box>
                    </Flex>
                    <Button
                      color="red"
                      variant="outline"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => setDeleteModalOpen(true)}
                      size="md"
                      radius="xl"
                    >
                      Delete Account
                    </Button>
                  </Group>
                </Card>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="activity" pt="xl">
            <Paper withBorder shadow="xl" p="md" radius="xl" bg="white">
              <Title order={2} size="h3" fw={600} mb="xl" c="dark">
                Your AccessAble Activity
              </Title>

              <Stack gap="xl">
                <SimpleGrid cols={2} spacing="lg">
                  <Card
                    withBorder
                    p="sm"
                    radius="xl"
                    bg="rgba(255, 255, 255, 0.95)"
                  >
                    <Group gap="md" mb="sm">
                      <ThemeIcon
                        variant="light"
                        size="lg"
                        radius="xl"
                        color="green"
                      >
                        <IconMapPinFilled size={18} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed" fw={500}>
                        Places Added
                      </Text>
                    </Group>
                    <Text size="2xl" fw={700} c="green.7" pl="md">
                      {activity?.placesAdded?.length || 0}
                    </Text>
                  </Card>

                  <Card
                    withBorder
                    p="sm"
                    radius="xl"
                    bg="rgba(255, 255, 255, 0.95)"
                  >
                    <Group gap="md" mb="sm">
                      <ThemeIcon
                        variant="light"
                        size="lg"
                        radius="xl"
                        color="violet"
                      >
                        <IconStar size={18} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed" fw={500}>
                        Reviews Added
                      </Text>
                    </Group>
                    <Text size="2xl" fw={700} c="violet.7" pl="md">
                      {activity?.reviewsAdded?.length || 0}
                    </Text>
                  </Card>
                </SimpleGrid>

                {/* Places Added Section */}
                <Box>
                  <Text size="xl" fw={600} mb="lg" c="dark">
                    Places You've Added to AccessAble
                  </Text>
                  {activity?.placesAdded && activity.placesAdded.length > 0 ? (
                    <SimpleGrid cols={1} spacing="md">
                      {activity.placesAdded.map((place, index) => (
                        <Card
                          key={index}
                          withBorder
                          p="sm"
                          radius="xl"
                          bg="rgba(255, 255, 255, 0.95)"
                        >
                          <Group justify="space-between" align="flex-start">
                            <Box flex={1}>
                              <Text size="lg" fw={600} c="dark" mb="xs">
                                {place.name}
                              </Text>
                              <Text size="sm" c="dimmed" mb="md">
                                {place.location}
                              </Text>
                              <Group gap="xs">
                                {place.hasRamp && (
                                  <Badge
                                    size="sm"
                                    color="green"
                                    variant="light"
                                    radius="xl"
                                  >
                                    Wheelchair Accessible
                                  </Badge>
                                )}
                                {place.hasAccessibleRestroom && (
                                  <Badge
                                    size="sm"
                                    color="blue"
                                    variant="light"
                                    radius="xl"
                                  >
                                    Accessible Restroom
                                  </Badge>
                                )}
                              </Group>
                            </Box>
                          </Group>
                        </Card>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(255, 255, 255, 0.95)"
                    >
                      <Text c="dimmed" ta="center" size="lg">
                        No places added yet. Start exploring and add your first
                        accessible place to help the community!
                      </Text>
                    </Card>
                  )}
                </Box>

                {/* Reviews Added Section */}
                <Box>
                  <Text size="xl" fw={600} mb="lg" c="dark">
                    Your AccessAble Reviews
                  </Text>
                  {activity?.reviewsAdded &&
                  activity.reviewsAdded.length > 0 ? (
                    <SimpleGrid cols={1} spacing="md">
                      {activity.reviewsAdded.map((rev, index) => (
                        <Card
                          key={index}
                          withBorder
                          p="sm"
                          radius="xl"
                          bg="rgba(255, 255, 255, 0.95)"
                        >
                          <Group justify="space-between" align="flex-start">
                            <Box flex={1}>
                              <Group gap="md" mb="sm">
                                <Group gap="xs">
                                  <ThemeIcon
                                    variant="light"
                                    size="sm"
                                    radius="xl"
                                    color="yellow"
                                  >
                                    <IconStar size={12} />
                                  </ThemeIcon>
                                  <Text fw={600} c="dark">
                                    {rev.rating}/5 Stars
                                  </Text>
                                </Group>
                                {rev.createdAt && (
                                  <Text size="xs" c="dimmed">
                                    {rev.createdAt}
                                  </Text>
                                )}
                              </Group>
                              {rev.comment && (
                                <Text size="sm" mb="sm" c="dark">
                                  {rev.comment}
                                </Text>
                              )}
                              <Text size="xs" c="dimmed">
                                {rev.placeName || rev.placeId}
                              </Text>
                            </Box>
                          </Group>
                        </Card>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Card
                      withBorder
                      p="sm"
                      radius="xl"
                      bg="rgba(255, 255, 255, 0.95)"
                    >
                      <Text c="dimmed" ta="center" size="lg">
                        No reviews yet. Share your experiences to help others
                        find accessible places!
                      </Text>
                    </Card>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Container>
      {/* Password Change Modal */}
      <Modal
        opened={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          passwordForm.reset();
        }}
        title={
          <Group gap="md" align="center">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: "violet", to: "blue" }}
              size="lg"
              radius="xl"
            >
              <IconLock size={20} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="dark">
              Change Your Password
            </Text>
          </Group>
        }
        size="lg"
        radius="xl"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            borderRadius: "1rem",
            border: "2px solid #e9ecef",
          },
          header: {
            backgroundColor: "rgba(151, 117, 250, 0.05)",
            borderRadius: "1rem 1rem 0 0",
            borderBottom: "1px solid #e9ecef",
            padding: "1.5rem",
          },
          body: {
            padding: "1.5rem",
          },
        }}
      >
        <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
          <Stack gap="xl">
            <Text size="sm" c="dimmed" ta="center" mb="sm">
              Keep your AccessAble account secure with a strong password
            </Text>

            <Stack gap="lg">
              <Box>
                <PasswordInput
                  label={
                    <Group gap="xs" mb="xs">
                      <ThemeIcon
                        size="sm"
                        variant="light"
                        color="gray"
                        radius="xl"
                      >
                        <IconLock size={12} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} c="dark">
                        Current Password
                      </Text>
                    </Group>
                  }
                  placeholder="Enter your current password"
                  required
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      border: "2px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#9775fa",
                        boxShadow: "0 0 0 3px rgba(151, 117, 250, 0.1)",
                      },
                    },
                  }}
                  {...passwordForm.getInputProps("currentPassword")}
                />
              </Box>

              <Box>
                <PasswordInput
                  label={
                    <Group gap="xs" mb="xs">
                      <ThemeIcon
                        size="sm"
                        variant="light"
                        color="blue"
                        radius="xl"
                      >
                        <IconLock size={12} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} c="dark">
                        New Password
                      </Text>
                    </Group>
                  }
                  placeholder="Enter your new password"
                  required
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      border: "2px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#4c6ef5",
                        boxShadow: "0 0 0 3px rgba(76, 110, 245, 0.1)",
                      },
                    },
                  }}
                  {...passwordForm.getInputProps("newPassword")}
                />
              </Box>

              <Box>
                <PasswordInput
                  label={
                    <Group gap="xs" mb="xs">
                      <ThemeIcon
                        size="sm"
                        variant="light"
                        color="violet"
                        radius="xl"
                      >
                        <IconLock size={12} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} c="dark">
                        Confirm New Password
                      </Text>
                    </Group>
                  }
                  placeholder="Confirm your new password"
                  required
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      border: "2px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#9775fa",
                        boxShadow: "0 0 0 3px rgba(151, 117, 250, 0.1)",
                      },
                    },
                  }}
                  {...passwordForm.getInputProps("confirmPassword")}
                />
              </Box>
            </Stack>

            <Group justify="flex-end" gap="md" pt="md">
              <Button
                variant="outline"
                color="gray"
                size="md"
                radius="xl"
                onClick={() => {
                  setPasswordModalOpen(false);
                  passwordForm.reset();
                }}
                styles={{
                  root: {
                    border: "2px solid #e9ecef",
                    "&:hover": {
                      backgroundColor: "#f8f9fa",
                      borderColor: "#ced4da",
                    },
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
                size="md"
                radius="xl"
                leftSection={<IconLock size={16} />}
              >
                Update Password
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Group gap="md" align="center">
            <ThemeIcon variant="light" color="red" size="lg" radius="xl">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="red.7">
              Delete Your Account
            </Text>
          </Group>
        }
        size="lg"
        radius="xl"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            borderRadius: "1rem",
            border: "2px solid #ffc9c9",
          },
          header: {
            backgroundColor: "rgba(255, 0, 0, 0.05)",
            borderRadius: "1rem 1rem 0 0",
            borderBottom: "1px solid #ffc9c9",
            padding: "1.5rem",
          },
          body: {
            padding: "1.5rem",
          },
        }}
      >
        <Stack gap="xl">
          <Card
            withBorder
            p="lg"
            radius="xl"
            bg="rgba(255, 0, 0, 0.05)"
            style={{
              border: "2px solid #ffc9c9",
            }}
          >
            <Group gap="md" align="flex-start" mb="md">
              <ThemeIcon variant="light" color="red" size="xl" radius="xl">
                <IconAlertTriangle size={24} />
              </ThemeIcon>
              <Box flex={1}>
                <Text size="lg" fw={700} c="red.7" mb="xs">
                  This action cannot be undone!
                </Text>
                <Text size="md" c="dark" mb="sm">
                  Deleting your account will permanently remove:
                </Text>
                <Stack gap="xs" ml="md">
                  <Group gap="xs">
                    <Text size="sm" c="red.6">
                      •
                    </Text>
                    <Text size="sm" c="dark">
                      All your profile information
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="red.6">
                      •
                    </Text>
                    <Text size="sm" c="dark">
                      Places you've added to AccessAble
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="red.6">
                      •
                    </Text>
                    <Text size="sm" c="dark">
                      Reviews and ratings you've shared
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="red.6">
                      •
                    </Text>
                    <Text size="sm" c="dark">
                      Your accessibility preferences
                    </Text>
                  </Group>
                </Stack>
              </Box>
            </Group>

            <Box
              p="md"
              bg="white"
              style={{
                borderRadius: "0.75rem",
                border: "1px solid #ffc9c9",
              }}
            >
              <Text size="sm" fw={600} c="red.8" ta="center">
                Are you absolutely sure you want to delete your AccessAble
                account?
              </Text>
            </Box>
          </Card>

          <Group justify="flex-end" gap="md" pt="md">
            <Button
              variant="outline"
              color="gray"
              size="md"
              radius="xl"
              onClick={() => setDeleteModalOpen(false)}
              styles={{
                root: {
                  border: "2px solid #e9ecef",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                    borderColor: "#ced4da",
                  },
                },
              }}
            >
              Keep My Account
            </Button>
            <Button
              color="red"
              variant="filled"
              size="md"
              radius="xl"
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteAccount}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "#c92a2a",
                  },
                },
              }}
            >
              Yes, Delete Forever
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default UserProfile;
