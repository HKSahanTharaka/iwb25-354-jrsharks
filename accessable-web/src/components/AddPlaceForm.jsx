import { useState } from 'react';
import { 
  Paper, 
  Group, 
  Tabs,
  LoadingOverlay,
  Progress,
  Stack,
  Badge,
  Text
} from '@mantine/core';
import { IconInfoCircle,IconAccessible } from '@tabler/icons-react';
import PlaceDetailsTab from './PlaceDetailsTab.jsx';
import AccessibilityTab from './AccessibilityTab';

function AddPlaceForm({ form, loading, progress, onSubmit }) {
  const [activeTab, setActiveTab] = useState('details');
  const [files, setFiles] = useState([]);


  return (
    <Paper 
      withBorder 
      shadow="sm" 
      p={{ base: 'md', md: 'xl' }} 
      radius="md"
      style={{ background: '#ffffff' }}
    >
      <LoadingOverlay 
        visible={loading} 
        overlayBlur={2} 
        loaderProps={{
          children: (
            <Stack align="center" spacing="sm">
              <Text weight={500}>Submitting your location</Text>
              <Progress value={progress} striped size="sm" style={{ width: 200 }} />
            </Stack>
          )
        }}
      />

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Tabs 
          value={activeTab} 
          onTabChange={setActiveTab}
          variant="pills"
          radius="md"
        >
          <Tabs.List grow mb="xl">
            <Tabs.Tab 
              value="details" 
              icon={<IconInfoCircle size={18} />}
              rightSection={
                form.isValid('name') && form.isValid('location') && form.isValid('locationUrl') ? (
                  <Badge color="teal" variant="light" size="xs" circle>✓</Badge>
                ) : null
              }
            >
              Place Details
            </Tabs.Tab>
            <Tabs.Tab 
              value="accessibility" 
              icon={<IconAccessible size={18} />}
             
            >
              Accessibility
            </Tabs.Tab>
          </Tabs.List>

          <PlaceDetailsTab 
            activeTab={activeTab}
            form={form}
            files={files}
            setFiles={setFiles}
            setActiveTab={setActiveTab}
          />

          <AccessibilityTab 
            activeTab={activeTab}
            form={form}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        </Tabs>
      </form>
    </Paper>
  );
}

export default AddPlaceForm;