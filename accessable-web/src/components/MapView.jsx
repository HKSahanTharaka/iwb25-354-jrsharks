import { useEffect, useRef, useState } from "react";
import {
  Card,
  Center,
  Loader,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  Textarea,
  Rating,
  Paper,
  Title,
  Flex,
  Box,
  Image,
  ActionIcon,
  TextInput,
  ScrollArea,
} from "@mantine/core";
import {
  IconLock,
  IconLockOpen,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const DEFAULT_ZOOM = 7;

function normalizeUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  let url = raw.trim();
  if (url.startsWith("@")) url = url.slice(1).trim();
  return url;
}

function parseLatLngFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const normalized = normalizeUrl(url);
  try {
    const qMatch = normalized.match(/[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
    if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];

    const atMatch = normalized.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
    if (atMatch) return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];

    const slashMatch = normalized.match(/\/(?:place\/)?(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:[\/?#]|$)/);
    if (slashMatch) return [parseFloat(slashMatch[1]), parseFloat(slashMatch[2])];
  } catch {}
  return null;
}

// helper to enable/disable map controls
function ScrollLockControl({ locked }) {
  const map = useMap();
  useEffect(() => {
    if (locked) {
      map.scrollWheelZoom.disable();
      map.dragging.disable();
    } else {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
    }
  }, [locked, map]);
  return null;
}

// helper component to fly to searched coords
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target?.lat && target?.lng) {
      map.flyTo([target.lat, target.lng], target.zoom || 14);
    }
  }, [target, map]);
  return null;
}

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const cacheRef = useRef({});
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [flyTo, setFlyTo] = useState(null);

  const [locked, setLocked] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPlaces() {
      try {
        const res = await fetch("/api/locations/getAllPlaces");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPlaces(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load places");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPlaces();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function geocode(text) {
      if (!text || typeof text !== "string") return null;
      const key = `geocode:${text}`;
      if (cacheRef.current[key]) return cacheRef.current[key];
      try {
        const fromLocal = localStorage.getItem(key);
        if (fromLocal) {
          const parsed = JSON.parse(fromLocal);
          cacheRef.current[key] = parsed;
          return parsed;
        }
      } catch {}
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const value = [lat, lon];
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch {}
          cacheRef.current[key] = value;
          return value;
        }
      } catch {}
      return null;
    }

    async function resolveAll() {
      const results = await Promise.all(
        (places || []).map(async (p) => {
          const parsed = parseLatLngFromUrl(p?.locationUrl);
          let coords = parsed;
          if (!coords && p?.location) coords = await geocode(p.location);
          if (!coords) return null;
          return {
            id: p.placeId,
            name: p.name,
            description: p.description,
            location: p.location,
            locationUrl: p.locationUrl,
            image1: p.image1,
            hasRamp: p.hasRamp,
            hasStepFreeEntrance: p.hasStepFreeEntrance,
            hasElevator: p.hasElevator,
            hasAccessibleRestroom: p.hasAccessibleRestroom,
            lat: coords[0],
            lng: coords[1],
          };
        })
      );
      setMarkers(results.filter(Boolean));
    }
    resolveAll();
  }, [places]);

  function localMatches(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];
    return markers
      .filter(
        (m) =>
          m?.name?.toLowerCase().includes(q) ||
          m?.location?.toLowerCase().includes(q) ||
          m?.description?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }

  async function geocodeExternal(text) {
    if (!text) return null;
    const key = `geocode:${text}`;
    if (cacheRef.current[key]) return cacheRef.current[key];
    try {
      const fromLocal = localStorage.getItem(key);
      if (fromLocal) {
        const parsed = JSON.parse(fromLocal);
        cacheRef.current[key] = parsed;
        return parsed;
      }
    } catch {}
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        text
      )}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const value = [lat, lon];
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {}
        cacheRef.current[key] = value;
        return value;
      }
    } catch {}
    return null;
  }

  async function handleSearchSubmit() {
    const text = searchText.trim();
    if (!text) return;
    const match = localMatches(text)[0];
    if (match) {
      setActiveMarkerId(match.id);
      setFlyTo({ lat: match.lat, lng: match.lng, zoom: 16, key: Date.now() });
      setSearchOpen(false);
      return;
    }
    setSearching(true);
    try {
      const coords = await geocodeExternal(text);
      if (coords) {
        setFlyTo({
          lat: coords[0],
          lng: coords[1],
          zoom: 16,
          key: Date.now(),
        });
        setSearchOpen(false);
      }
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <Card withBorder shadow="sm" p="xl" radius="md" style={{ minHeight: "600px" }}>
        <Center style={{ height: "100%" }}>
          <Loader />
        </Center>
      </Card>
    );
  }

  if (error) {
    return (
      <Card withBorder shadow="sm" p="xl" radius="md" style={{ minHeight: "300px" }}>
        <Center style={{ height: "100%" }}>
          <Text c="red">{error}</Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card
      withBorder
      shadow="sm"
      p={0}
      radius="md"
      style={{ height: "85vh", overflow: "hidden", position: "relative", zIndex: 0 }}
    >
      <div style={{ position: "absolute", zIndex: 1000, right: 15, top: 15 }}>
        <Button
          size="xs"
          variant="filled"
          color={locked ? "red" : "teal"}
          leftSection={locked ? <IconLock size={14} /> : <IconLockOpen size={14} />}
          onClick={() => setLocked(!locked)}
        >
          {locked ? "Locked" : "Unlocked"}
        </Button>
      </div>

      <MapContainer
        center={markers.length ? [markers[0].lat, markers[0].lng] : SRI_LANKA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={!locked}
      >
        <MapFlyTo target={flyTo} />

        {/* Search overlay */}
        <div style={{ position: "absolute", top: 12, right: 125, zIndex: 1000, pointerEvents: "none" }}>
          <Group gap={10} align="start" style={{ pointerEvents: "auto" }}>
            {searchOpen && (
              <Paper withBorder shadow="md" radius="md" p="xs" style={{ background: "rgba(255,255,255,0.97)" }}>
                <Stack gap={8} style={{ minWidth: 300 }}>
                  <Group gap={6} align="center" justify="space-between">
                    <Text fw={600} size="sm">
                      Search
                    </Text>
                    <ActionIcon variant="subtle" size="sm" onClick={() => setSearchOpen(false)}>
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                  <TextInput
                    placeholder="Search places or address"
                    value={searchText}
                    onChange={(e) => setSearchText(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    size="sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                      }
                    }}
                  />
                  {searchText && (
                    <ScrollArea h={140} offsetScrollbars>
                      <Stack gap={4}>
                        {localMatches(searchText).length === 0 ? (
                          <Text size="xs" c="dimmed">
                            Press Enter to search by address
                          </Text>
                        ) : (
                          localMatches(searchText).map((m) => (
                            <Button
                              key={m.id}
                              variant="subtle"
                              size="sm"
                              fullWidth
                              onClick={() => {
                                setActiveMarkerId(m.id);
                                setFlyTo({ lat: m.lat, lng: m.lng, zoom: 16, key: Date.now() });
                                setSearchOpen(false);
                              }}
                              style={{ justifyContent: "flex-start" }}
                            >
                              {m.name || m.location}
                            </Button>
                          ))
                        )}
                      </Stack>
                    </ScrollArea>
                  )}
                </Stack>
              </Paper>
            )}
            <ActionIcon variant="filled" color="blue" size="xl" onClick={() => setSearchOpen((v) => !v)}>
              <IconSearch size={24} />
            </ActionIcon>
          </Group>
        </div>

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ScrollLockControl locked={locked} />

        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} eventHandlers={{ click: () => setActiveMarkerId(m.id) }}>
            <Popup maxWidth={600} closeButton>
              <MapPopupContent place={m} isActive={activeMarkerId === m.id} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}

function MapPopupContent({ place, isActive }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    let cancelled = false;
    async function fetchReviews() {
      if (!isActive || !place?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/locations/getReviewsByPlace/${place.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [isActive, place?.id]);

  async function submitReview() {
    if (!place?.id) return;
    const payload = {
      placeId: place.id,
      rating: Math.min(5, Math.max(1, Number(rating) || 1)),
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };
    setSubmitting(true);
    try {
      const res = await fetch("/api/locations/addReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setComment("");
      setRating(5);
      const listRes = await fetch(`/api/locations/getReviewsByPlace/${place.id}`);
      if (listRes.ok) {
        const list = await listRes.json();
        setReviews(Array.isArray(list) ? list : []);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  }

  const tags = [
    place.hasRamp && "Wheelchair ramp",
    place.hasStepFreeEntrance && "Step-free entrance",
    place.hasElevator && "Elevator/lift",
    place.hasAccessibleRestroom && "Accessible restroom",
  ].filter(Boolean);

  const avg =
    reviews && reviews.length
      ? Number((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1))
      : null;

  return (
    <Paper p="xs" radius="md" withBorder style={{ width: 600 }}>
      <Flex gap="sm" align="flex-start">
        {/* Left: Image + place info */}
        <Box w="30%">
          {place.image1 && <Image src={place.image1} alt={place.name} height={120} fit="cover" radius="sm" />}
          <Title order={5} mt="xs">
            {place.name}
          </Title>
          <Text size="xs" color="dimmed">
            {place.location}
          </Text>
          <Group mt="xs" spacing={4}>
            {tags.map((t) => (
              <Badge key={t} size="xs" color="teal">
                {t}
              </Badge>
            ))}
          </Group>
        </Box>

        {/* Middle: Reviews */}
        <Box w="40%" style={{ maxHeight: 300, overflowY: "auto" }}>
          <Title order={6}>Reviews {avg && `(${avg}/5)`}</Title>
          {loading ? (
            <Text size="xs" color="dimmed">
              Loading reviews...
            </Text>
          ) : reviews.length === 0 ? (
            <Text size="xs" color="dimmed">
              No reviews yet
            </Text>
          ) : (
            <Stack spacing={4}>
              {reviews.map((r) => (
                <Paper key={r.reviewId} p="xs" withBorder radius="sm">
                  <Group position="apart" spacing={4}>
                    <Badge size="xs">{r.rating}/5</Badge>
                    <Text size="10px" color="dimmed">
                      {r.createdAt?.split("T")[0]}
                    </Text>
                  </Group>
                  <Text size="xs">{r.comment}</Text>
                  <Text size="10px" color="dimmed">
                    {r.userEmail || "Anonymous"}
                  </Text>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {/* Right: Add Review */}
        <Box w="30%" style={{ maxHeight: 300 }}>
          <Title mb="xs"
 order={6}>
            Add Review
          </Title>
          <Rating mb="xs" value={rating} onChange={setRating} size="sm" />
          <Textarea
            placeholder="Write your review..."
            size="xs"
            mb="xs"
            mt="xs"
            autosize
            minRows={2}
            maxRows={4}
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          <Button
            size="xs"
            fullWidth
            loading={submitting}
            onClick={submitReview}
          >
            Submit
          </Button>
        </Box>
      </Flex>
    </Paper>
  );
}
