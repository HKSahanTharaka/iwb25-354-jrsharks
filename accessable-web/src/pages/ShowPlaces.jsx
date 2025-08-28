import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Grid,
  Text,
  Badge,
  Group,
  Container,
  Title,
  LoadingOverlay,
  Alert,
  Button,
  Image,
  Modal,
  Anchor,
  Divider,
  Stack,
  SimpleGrid,
  TextInput,
  MultiSelect,
  Pagination,
  Box,
  Center,
  Flex,
} from "@mantine/core";
import {
  IconWheelchair,
  IconElevator,
  IconDogBowl,
  IconParking,
  IconAccessible,
  IconMapPin,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconStar,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconBuilding,
  IconRoute,
  IconStairs,
  IconBuildingStore,
  IconMapPinFilled,
  IconAccessPoint,
  IconDisabled,
  IconMap2,
  IconLocation,
  IconBuildingHospital,
  IconBuildingBank,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { buildApiUrl } from '../config/api.js';
import { useAuth } from "../context/AuthContext.jsx";
const MinimalBackgroundIllustration = () => (
  <Box
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -2,
      overflow: "hidden",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}
  >
    {/* Subtle geometric pattern */}
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        opacity: 0.1,
      }}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="grid"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    {/* Floating geometric shapes - all circles */}
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        opacity: 0.05,
      }}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="200" cy="150" r="80" fill="white" />
      <circle cx="760" cy="160" r="60" fill="white" />
      <circle cx="100" cy="400" r="60" fill="white" />
      <circle cx="850" cy="400" r="50" fill="white" />
      <circle cx="150" cy="700" r="70" fill="white" />
      <circle cx="655" cy="705" r="55" fill="white" />
      <circle cx="850" cy="750" r="65" fill="white" />
    </svg>

    {/* Subtle overlay for better text contrast */}
    <Box
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.1)",
        zIndex: -1,
      }}
    />
  </Box>
);

function ShowPlaces() {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [query, setQuery] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(
         buildApiUrl('locations/getAllPlaces')
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPlaces(data);
      } catch (err) {
        console.error("Error fetching places:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const getAccessibilityFeatures = (place) => {
    const featureMap = [
      { key: "hasRamp", label: "Wheelchair ramp", icon: IconWheelchair },
      {
        key: "hasStepFreeEntrance",
        label: "Step-free entrance",
        icon: IconAccessible,
      },
      { key: "hasElevator", label: "Elevator/lift", icon: IconElevator },
      {
        key: "hasAccessibleRestroom",
        label: "Accessible restroom",
        icon: IconDisabled,
      },
      { key: "hasWidePathways", label: "Wide pathways", icon: IconRoute },
      {
        key: "hasBrailleSignage",
        label: "Braille signage",
        icon: IconAccessPoint,
      },
      {
        key: "hasHighContrastSignage",
        label: "High-contrast signage",
        icon: IconAccessPoint,
      },
      { key: "hasAudioGuidance", label: "Audio guide", icon: IconAccessPoint },
      {
        key: "hasSubtitledVideos",
        label: "Subtitled videos",
        icon: IconAccessPoint,
      },
      {
        key: "hasSignLanguage",
        label: "Sign language staff",
        icon: IconAccessPoint,
      },
      {
        key: "hasVisualAlarmSystem",
        label: "Visual alarm system",
        icon: IconAccessPoint,
      },
      {
        key: "hasQuietSensoryArea",
        label: "Quiet/sensory-friendly area",
        icon: IconAccessPoint,
      },
      {
        key: "hasClearSimpleSignage",
        label: "Clear/simple signage",
        icon: IconAccessPoint,
      },
      {
        key: "hasFirstAidStation",
        label: "First aid station",
        icon: IconBuildingHospital,
      },
      { key: "hasRestSeating", label: "Rest seating", icon: IconAccessPoint },
    ];
    return featureMap.map(({ key, label, icon }) => ({
      label,
      value: Boolean(place?.[key]),
      icon,
    }));
  };

  const allFeatureOptions = useMemo(
    () => [
      { value: "hasRamp", label: "Wheelchair ramp" },
      { value: "hasStepFreeEntrance", label: "Step-free entrance" },
      { value: "hasElevator", label: "Elevator/lift" },
      { value: "hasAccessibleRestroom", label: "Accessible restroom" },
      { value: "hasWidePathways", label: "Wide pathways" },
      { value: "hasBrailleSignage", label: "Braille signage" },
      { value: "hasHighContrastSignage", label: "High-contrast signage" },
      { value: "hasAudioGuidance", label: "Audio guide" },
      { value: "hasSubtitledVideos", label: "Subtitled videos" },
      { value: "hasSignLanguage", label: "Sign language staff" },
      { value: "hasVisualAlarmSystem", label: "Visual alarm system" },
      { value: "hasQuietSensoryArea", label: "Quiet/sensory-friendly area" },
      { value: "hasClearSimpleSignage", label: "Clear/simple signage" },
      { value: "hasFirstAidStation", label: "First aid station" },
      { value: "hasRestSeating", label: "Rest seating" },
    ],
    []
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedFeatures]);

  const filteredPlaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasSelectedFeatures = selectedFeatures && selectedFeatures.length > 0;
    return places.filter((place) => {
      const matchesQuery =
        q === "" ||
        place?.name?.toLowerCase().includes(q) ||
        place?.location?.toLowerCase().includes(q) ||
        place?.description?.toLowerCase().includes(q);

      const matchesFeatures =
        !hasSelectedFeatures ||
        selectedFeatures.every((key) => Boolean(place?.[key]));

      return matchesQuery && matchesFeatures;
    });
  }, [places, query, selectedFeatures]);

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredPlaces.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <Box style={{ minHeight: "100vh", position: "relative" }}>
        <MinimalBackgroundIllustration />
        <Container size="lg" py={60}>
          <Center style={{ height: "50vh" }}>
            <Stack align="center" spacing="xl">
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 2s infinite",
                }}
              >
                <IconMapPinFilled size={50} color="white" />
              </Box>
              <Text size="xl" color="white" align="center" weight={500}>
                Loading accessible places...
              </Text>
            </Stack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={{ minHeight: "100vh", position: "relative" }}>
        <MinimalBackgroundIllustration />
        <Container size="lg" py={60}>
          <Alert
            icon={<IconAlertCircle size={18} />}
            title="Error Loading Places"
            color="red"
            variant="filled"
            radius="lg"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            {error} - Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (places.length === 0) {
    return (
      <Box style={{ minHeight: "100vh", position: "relative" }}>
        <MinimalBackgroundIllustration />
        <Container size="lg" py={60}>
          <Center style={{ height: "50vh" }}>
            <Stack align="center" spacing="xl">
              <Box
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconLocation size={70} color="white" />
              </Box>
              <Stack align="center" spacing="sm">
                <Title order={2} color="white" align="center">
                  No Places Found
                </Title>
                <Text color="rgba(255, 255, 255, 0.8)" align="center">
                  Be the first to add accessible locations in Sri Lanka!
                </Text>
              </Stack>
            </Stack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", position: "relative" }}>
      <MinimalBackgroundIllustration />

      {/* Hero Section */}
      <Box pt={60} pb={40}>
        <Container size="lg">
          <Center mb={40}>
            <Stack align="center" spacing="lg">
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <IconMapPinFilled size={50} color="white" />
              </Box>
              <Title
                order={1}
                color="white"
                align="center"
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
              >
                Explore Places
              </Title>
              <Text
                size="xl"
                color="rgba(255, 255, 255, 0.9)"
                align="center"
                maw={600}
                style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)" }}
              >
                Discover accessible locations across Sri Lanka and share your
                experiences
              </Text>
            </Stack>
          </Center>

          {/* Search and Filter Section */}
          <Card
            radius="xl"
            p="xl"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Grid gutter="lg" align="end">
              <Grid.Col xs={12} sm={6} md={5}>
                <TextInput
                  label="Search Places"
                  placeholder="Search by name, location or description"
                  icon={<IconSearch size={18} />}
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  radius="lg"
                  size="md"
                  styles={{
                    input: {
                      background: "rgba(103, 126, 234, 0.05)",
                      border: "1px solid rgba(103, 126, 234, 0.2)",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(103, 126, 234, 0.2)",
                      },
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col xs={12} sm={6} md={5}>
                <MultiSelect
                  label="Accessibility Features"
                  placeholder="Filter by features"
                  icon={<IconFilter size={18} />}
                  data={allFeatureOptions}
                  value={selectedFeatures}
                  onChange={setSelectedFeatures}
                  searchable
                  clearable
                  radius="lg"
                  size="md"
                  styles={{
                    input: {
                      background: "rgba(103, 126, 234, 0.05)",
                      border: "1px solid rgba(103, 126, 234, 0.2)",
                      "&:focus": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Grid.Col>
              {(query || selectedFeatures.length > 0) && (
                <Grid.Col xs={12} sm={12} md={2}>
                  <Flex direction="column" align="stretch" gap="xs">
                    <Button
                      variant="light"
                      color="gray"
                      radius="lg"
                      onClick={() => {
                        setQuery("");
                        setSelectedFeatures([]);
                      }}
                    >
                      Clear All
                    </Button>
                    <Text size="sm" color="dimmed" align="center">
                      {filteredPlaces.length} result(s)
                    </Text>
                  </Flex>
                </Grid.Col>
              )}
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* Places Grid Section */}
      <Container size="lg" pb={60}>
        {filteredPlaces.length === 0 ? (
          <Center py={60}>
            <Stack align="center" spacing="xl">
              <Box
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <IconSearch size={60} color="white" />
              </Box>
              <Stack align="center" spacing="sm">
                <Title order={3} color="white" align="center">
                  No matching places found
                </Title>
                <Text color="rgba(255, 255, 255, 0.8)" align="center">
                  Try adjusting your search terms or filters
                </Text>
              </Stack>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: "md", cols: 2 },
              { maxWidth: "sm", cols: 1 },
            ]}
          >
            {pageItems.map((place) => {
              const features = getAccessibilityFeatures(place).filter(
                (f) => f.value
              );

              return (
                <Card
                  key={place.placeId}
                  radius="lg"
                  p={0}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    minHeight: "300px",
                    height: "auto",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  {place.image1 && (
                    <Card.Section>
                      <Box style={{ position: "relative" }}>
                        <Image
                          src={place.image1}
                          height={160}
                          alt={place.name}
                          withPlaceholder
                        />
                      </Box>
                    </Card.Section>
                  )}

                  <Stack p="md" spacing="sm">
                    <Group position="apart" align="flex-start">
                      <Title
                        order={4}
                        size="md"
                        color="#2d3748"
                        lineClamp={2}
                        style={{ fontSize: "1.1rem", fontWeight: 600 }}
                      >
                        {place.name}
                      </Title>
                      <Group spacing={6}>
                        {place.hasRamp && (
                          <Box
                            style={{
                              background: "rgba(72, 187, 120, 0.15)",
                              borderRadius: "50%",
                              padding: 8,
                            }}
                          >
                            <IconWheelchair size={20} color="#48bb78" />
                          </Box>
                        )}
                        {place.hasElevator && (
                          <Box
                            style={{
                              background: "rgba(66, 153, 225, 0.15)",
                              borderRadius: "50%",
                              padding: 8,
                            }}
                          >
                            <IconElevator size={20} color="#4299e1" />
                          </Box>
                        )}
                        {place.hasAccessibleRestroom && (
                          <Box
                            style={{
                              background: "rgba(159, 122, 234, 0.15)",
                              borderRadius: "50%",
                              padding: 8,
                            }}
                          >
                            <IconAccessible size={20} color="#9f7aea" />
                          </Box>
                        )}
                      </Group>
                    </Group>

                    <Group spacing={8}>
                      <IconMapPin size={18} color="#718096" />
                      <Text
                        size="md"
                        color="#4a5568"
                        lineClamp={1}
                        style={{ fontSize: "0.95rem" }}
                      >
                        {place.location}
                      </Text>
                    </Group>

                    <Text
                      size="md"
                      color="#4a5568"
                      lineClamp={2}
                      style={{
                        minHeight: "2.8em",
                        fontSize: "0.9rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {place.description}
                    </Text>

                    <Group spacing={8}>
                      {features.length > 0 ? (
                        features.slice(0, 2).map((feature, index) => (
                          <Badge
                            key={index}
                            variant="light"
                            color="teal"
                            radius="lg"
                            size="sm"
                            leftSection={<feature.icon size={14} />}
                          >
                            {feature.label}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="light"
                          color="gray"
                          radius="lg"
                          size="sm"
                        >
                          No features listed
                        </Badge>
                      )}
                      {features.length > 2 && (
                        <Badge
                          variant="light"
                          color="blue"
                          radius="lg"
                          size="sm"
                        >
                          +{features.length - 2} more
                        </Badge>
                      )}
                    </Group>

                    <Stack spacing="xs" mt="xs">
                      <Button
                        variant="gradient"
                        gradient={{ from: "#667eea", to: "#764ba2" }}
                        fullWidth
                        radius="lg"
                        size="sm"
                        leftIcon={<IconEye size={18} />}
                        onClick={() => {
                          setSelectedPlace(place);
                          setDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>

                      <Group grow spacing="xs">
                        <Button
                          variant="light"
                          color="blue"
                          radius="lg"
                          size="xs"
                          leftIcon={<IconMessageCircle size={16} />}
                          onClick={async () => {
                            setSelectedPlace(place);
                            setReviewsOpen(true);
                            setReviewLoading(true);
                            try {
                              const res = await fetch(
                                buildApiUrl(`locations/getAllPlaces/${place.placeId}`)
                              );
                              if (!res.ok)
                                throw new Error(`HTTP ${res.status}`);
                              const data = await res.json();
                              setReviews(Array.isArray(data) ? data : []);
                            } catch (e) {
                              console.error("Failed to load reviews", e);
                              setReviews([]);
                            } finally {
                              setReviewLoading(false);
                            }
                          }}
                        >
                          Reviews
                        </Button>
                        <Button
                          variant="light"
                          color="green"
                          radius="lg"
                          size="xs"
                          leftIcon={<IconStar size={16} />}
                          onClick={() => {
                            setSelectedPlace(place);
                            setAddReviewOpen(true);
                          }}
                        >
                          Rate
                        </Button>
                      </Group>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        {filteredPlaces.length > pageSize && (
          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              color="white"
              radius="lg"
              size="md"
              styles={{
                control: {
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  "&[data-active]": {
                    background: "rgba(255, 255, 255, 0.25)",
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.2)",
                  },
                },
              }}
            />
          </Center>
        )}
      </Container>

      {/* Modals */}
      <Modal
        opened={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selectedPlace?.name || "Place Details"}
        size="lg"
        centered
        radius="lg"
        styles={{
          modal: {
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          },
          title: {
            color: "#2d3748",
            fontWeight: 600,
          },
        }}
      >
        {selectedPlace && (
          <Stack spacing="lg">
            <Group spacing={10}>
              <IconMapPinFilled size={20} color="#667eea" />
              <Text size="sm" color="#718096">
                {selectedPlace.location}
              </Text>
              {selectedPlace.locationUrl && (
                <Anchor
                  href={selectedPlace.locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  ml="sm"
                >
                  <Group spacing={6}>
                    <IconMap2 size={16} />
                    Open map
                  </Group>
                </Anchor>
              )}
            </Group>

            {selectedPlace.description && (
              <Text size="sm" color="#4a5568">
                {selectedPlace.description}
              </Text>
            )}

            {(selectedPlace.image1 ||
              selectedPlace.image2 ||
              selectedPlace.image3) && (
              <>
                <Divider label="Photos" labelStyle={{ color: "#718096" }} />
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  {["image1", "image2", "image3"].map((imgKey) =>
                    selectedPlace?.[imgKey] ? (
                      <Image
                        key={imgKey}
                        src={selectedPlace[imgKey]}
                        radius="lg"
                        withPlaceholder
                        alt={`${selectedPlace.name} ${imgKey}`}
                      />
                    ) : null
                  )}
                </SimpleGrid>
              </>
            )}

            <Divider
              label="Accessibility Features"
              labelStyle={{ color: "#718096" }}
            />
            <SimpleGrid cols={1} spacing="sm">
              {getAccessibilityFeatures(selectedPlace).map((f) => (
                <Group key={f.label} spacing={12}>
                  <Box
                    style={{
                      background: f.value
                        ? "rgba(72, 187, 120, 0.15)"
                        : "rgba(160, 174, 192, 0.1)",
                      borderRadius: "50%",
                      padding: 8,
                    }}
                  >
                    {f.value ? (
                      <IconCheck size={18} color="#48bb78" />
                    ) : (
                      <IconX size={18} color="#a0aec0" />
                    )}
                  </Box>
                  <f.icon size={20} color={f.value ? "#667eea" : "#a0aec0"} />
                  <Text
                    size="sm"
                    color={f.value ? "#2d3748" : "#a0aec0"}
                    weight={f.value ? 500 : 400}
                  >
                    {f.label}
                  </Text>
                </Group>
              ))}
            </SimpleGrid>

            <Divider />
            <Group position="apart">
              <Text size="xs" color="#a0aec0">
                Added by: {selectedPlace.addedBy || "Unknown"}
              </Text>
              <Text size="xs" color="#a0aec0">
                ID: {selectedPlace.placeId}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        title={`Reviews - ${selectedPlace?.name || ""}`}
        size="lg"
        centered
        radius="lg"
        styles={{
          modal: {
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          },
          title: {
            color: "#2d3748",
            fontWeight: 600,
          },
        }}
      >
        <Stack>
          {reviewLoading && <LoadingOverlay visible />}
          {(!reviews || reviews.length === 0) && !reviewLoading ? (
            <Alert
              color="blue"
              title="No reviews yet"
              radius="lg"
              style={{
                background: "rgba(66, 153, 225, 0.1)",
                border: "1px solid rgba(66, 153, 225, 0.2)",
              }}
            >
              Be the first to review this place and help others!
            </Alert>
          ) : (
            reviews.map((r) => (
              <Card
                key={r.reviewId}
                withBorder
                radius="lg"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                <Group position="apart" mb="xs">
                  <Group spacing="xs">
                    <IconStar size={18} color="#f59e0b" />
                    <Text fw={600} color="#2d3748">
                      {r.rating}/5
                    </Text>
                  </Group>
                  <Text size="xs" color="#a0aec0">
                    {r.createdAt || ""}
                  </Text>
                </Group>
                {r.comment && (
                  <Text size="sm" color="#4a5568">
                    {r.comment}
                  </Text>
                )}
                <Text size="xs" color="#718096" mt="xs">
                  {r.userEmail || "Anonymous"}
                </Text>
              </Card>
            ))
          )}
        </Stack>
      </Modal>

      <Modal
        opened={addReviewOpen}
        onClose={() => setAddReviewOpen(false)}
        title={`Add Review - ${selectedPlace?.name || ""}`}
        size="md"
        centered
        radius="lg"
        styles={{
          modal: {
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          },
          title: {
            color: "#2d3748",
            fontWeight: 600,
          },
        }}
      >
        <Stack>
          <TextInput
            label="Rating (1-5)"
            type="number"
            min={1}
            max={5}
            value={newRating}
            onChange={(e) => setNewRating(Number(e.currentTarget.value))}
            radius="lg"
            leftSection={<IconStar size={18} color="#f59e0b" />}
            styles={{
              input: {
                background: "rgba(103, 126, 234, 0.05)",
                border: "1px solid rgba(103, 126, 234, 0.2)",
              },
            }}
          />
          <TextInput
            label="Comment"
            placeholder="Share your experience..."
            value={newComment}
            onChange={(e) => setNewComment(e.currentTarget.value)}
            radius="lg"
            leftSection={<IconMessageCircle size={18} color="#667eea" />}
            styles={{
              input: {
                background: "rgba(103, 126, 234, 0.05)",
                border: "1px solid rgba(103, 126, 234, 0.2)",
              },
            }}
          />
          <Group position="right">
            <Button
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2" }}
              radius="lg"
              leftIcon={<IconCheck size={18} />}
              onClick={async () => {
                if (!selectedPlace) return;
                const payload = {
                  placeId: selectedPlace.placeId,
                  rating: Math.min(5, Math.max(1, Number(newRating) || 1)),
                  comment: newComment,
                  createdAt: new Date().toISOString(),
                  userEmail: user?.email,
                };
                try {
                  const res = await fetch(
                    buildApiUrl('locations/addReview'),
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }
                  );
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  setAddReviewOpen(false);
                  setNewComment("");
                  setNewRating(5);
                } catch (e) {
                  console.error("Failed to add review", e);
                }
              }}
            >
              Submit Review
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default ShowPlaces;
