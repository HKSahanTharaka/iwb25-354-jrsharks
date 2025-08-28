import { 
  Stack, 
  Alert, 
  Grid, 
  Divider, 
  Group, 
  Button, 
  Text,
  Card,
  Box,
  ThemeIcon,
  Progress,
  Tabs,
  GridCol
} from '@mantine/core';
import { 
  IconWheelchair, 
  IconStairs, 
  IconToiletPaper, 
  IconChairDirector,
  IconBraille, 
  IconWalk, 
  IconHeadphones, 
  IconEar, 
  IconLanguage,
  IconUserHeart, 
  IconVolumeOff,
  IconInfoCircle,
  IconCheck
} from '@tabler/icons-react';

function AccessibilityTab({ activeTab, form, loading, setActiveTab }) {
  const FeatureCard = ({ icon, label, checked, name, description }) => (
    <Card 
      withBorder 
      p="md" 
      radius="md" 
      style={{ 
        cursor: 'pointer',
        borderColor: checked ? '#228be6' : '#e9ecef',
        backgroundColor: checked ? '#f8fafc' : 'white',
        transition: 'all 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }}
      onClick={() => form.setFieldValue(name, !checked)}
    >
      <Stack spacing="xs">
        <Group noWrap>
          <ThemeIcon 
            color={checked ? 'blue' : 'gray'} 
            variant={checked ? 'light' : 'outline'}
            size="lg"
            radius="md"
          >
            {icon}
          </ThemeIcon>
          <Text size="sm" fw={600}>{label}</Text>
        </Group>
        {description && (
          <Text size="xs" color="dimmed">
            {description}
          </Text>
        )}
      </Stack>
    </Card>
  );

  // Enhanced SectionHeader component for consistent styling
  const SectionHeader = ({ icon, title }) => (
    <Group spacing={8} mb={12}>
      {icon}
      <Text 
        fw={800} 
        size="lg"
        sx={{
          fontFamily: 'inherit',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: '#333'
        }}
      >
        {title}
      </Text>
    </Group>
  );

  return (
    <Tabs.Panel value="accessibility" pt="sm">
      <Stack spacing={32}> {/* Increased spacing between sections */}
        <Alert 
          icon={<IconInfoCircle size={20} />} 
          color="indigo" 
          radius="md"
          variant="light"
        >
          <Text size="sm">
            Select all accessibility features available at this location. 
          </Text>
        </Alert>

        {/* Mobility Access Section */}
        <Box>
          <SectionHeader 
            icon={<IconWheelchair size={24} />}
            title="Mobility Access"
          />
          <Divider mb={24} />
          <Grid > {/* Increased gutter spacing */}
            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconStairs size={20} />}
                label="Wheelchair Ramp"
                description="Gentle slope for wheelchair access"
                checked={form.values.hasRamp}
                name="hasRamp"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconStairs size={20} />}
                label="Step-free entrance"
                description="No steps, level entry"
                checked={form.values.hasStepFreeEntrance}
                name="hasStepFreeEntrance"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconStairs size={20} />}
                label="Elevator/Lift"
                description="Available for multi-level access"
                checked={form.values.hasElevator}
                name="hasElevator"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconWheelchair size={20} />}
                label="Wide pathways"
                description="Spacious corridors and routes"
                checked={form.values.hasWidePathways}
                name="hasWidePathways"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconToiletPaper size={20} />}
                label="Accessible restroom"
                description="Spacious with grab bars"
                checked={form.values.hasAccessibleRestroom}
                name="hasAccessibleRestroom"
              />
            </Grid.Col>

          </Grid>
        </Box>

        {/* Visual Accessibility Section */}
        <Box>
          <SectionHeader 
            icon={<IconBraille size={24} />}
            title="Visual Accessibility"
          />
          <Divider mb={24} />
          <Grid gutter="xl">
            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconBraille size={20} />}
                label="Braille Signage"
                description="Tactile signs with braille"
                checked={form.values.hasBrailleSignage}
                name="hasBrailleSignage"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4}>
              <FeatureCard 
                icon={<IconWalk size={20} />}
                label="High-contrast signage"
                checked={form.values.hasHighContrastSignage}
                name="hasHighContrastSignage"
              />
            </Grid.Col>
          </Grid>
        </Box>

        {/* Hearing Accessibility Section */}
        <Box>
          <SectionHeader 
            icon={<IconEar size={24} />}
            title="Hearing Accessibility"
          />
          <Divider mb={24} />
          <Grid gutter="xl">
            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconHeadphones size={20} />}
                label="Audio guide"
                description="Audio descriptions or guidance"
                checked={form.values.hasAudioGuidance}
                name="hasAudioGuidance"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconHeadphones size={20} />}
                label="Subtitled videos"
                description="Captions available on videos"
                checked={form.values.hasSubtitledVideos}
                name="hasSubtitledVideos"
              />
            </Grid.Col>

            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconLanguage size={20} />}
                label="Sign language staff"
                description="Trained in sign language"
                checked={form.values.hasSignLanguage}
                name="hasSignLanguage"
              />
            </Grid.Col>

            {/* Other hearing feature cards */}
          </Grid>
        </Box>

        {/* Other Features Section */}
        <Box>
          <SectionHeader 
            icon={<IconUserHeart size={24} />}
            title="Other Features"
          />
          <Divider mb={24} />
          <Grid gutter="xl">
            <Grid.Col xs={6} sm={4} lg={3}>
              <FeatureCard 
                icon={<IconUserHeart size={20} />}
                label="Visual alarm system"
                checked={form.values.hasVisualAlarmSystem}
                name="hasVisualAlarmSystem"
              />
            </Grid.Col>
            <Grid.Col xs={6} sm={4}>
              <FeatureCard 
                icon={<IconVolumeOff size={20} />}
                label="Quiet/sensory-friendly area"
                checked={form.values.hasQuietSensoryArea}
                name="hasQuietSensoryArea"
              />
            </Grid.Col>
            <Grid.Col xs={6} sm={4}>
              <FeatureCard 
                icon={<IconUserHeart size={20} />}
                label="Clear/simple signage"
                checked={form.values.hasClearSimpleSignage}
                name="hasClearSimpleSignage"
              />
            </Grid.Col>
            <Grid.Col xs={6} sm={4}>
              <FeatureCard 
                icon={<IconUserHeart size={20} />}
                label="First aid station"
                checked={form.values.hasFirstAidStation}
                name="hasFirstAidStation"
              />
            </Grid.Col>
            <Grid.Col xs={6} sm={4}>
              <FeatureCard 
                icon={<IconChairDirector size={20} />}
                label="Rest seating"
                checked={form.values.hasRestSeating}
                name="hasRestSeating"
              />
            </Grid.Col>
            {/* Other feature cards */}
          </Grid>
        </Box>

        <Group mt={40} position="apart">
          <Button 
            onClick={() => setActiveTab('details')}
            variant="default"
            leftIcon={<IconInfoCircle size={18} />}
            size="md"
          >
            Back to Details
          </Button>
          <Button 
            type="submit" 
            variant="filled"
            color="blue"
            size="md"
            disabled={loading}
            rightIcon={<IconCheck size={18} />}
          >
            Submit Location
          </Button>
        </Group>
      </Stack>
    </Tabs.Panel>
  );
}

export default AccessibilityTab;