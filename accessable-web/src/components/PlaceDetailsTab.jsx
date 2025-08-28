import { useState,useEffect } from 'react';
import { 
  Grid, 
  TextInput, 
  Divider, 
  Alert, 
  Group, 
  Button, 
  Tooltip,
  Avatar,
  Box,
  ActionIcon,
  ThemeIcon,
  Text,
  Stack,
  Tabs,
  Anchor
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto, IconAccessible, IconMapPin, IconInfoCircle } from '@tabler/icons-react';

function PlaceDetailsTab({ activeTab, form, files, setFiles, setActiveTab }) {
  const [locationLink, setLocationLink] = useState('');

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
    };
  }, [files]);

const handleFileUpload = async (newFiles) => {
  if (files.length + newFiles.length > MAX_FILES) {
    notifications.show({ color: 'yellow', title: 'Upload limit', message: `You can only upload up to ${MAX_FILES} files` });
    return;
  }
  
  const allFiles = [...files, ...newFiles];
  setFiles(allFiles);
  
  // Convert files to base64 and update form
  const base64Images = await Promise.all(
    allFiles.map(file => convertToBase64(file))
  );
  form.setFieldValue('images', base64Images);
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  const MAX_SIZE_MB = 5; 
  const MAX_FILES = 5; 

  const previews = files.map((file, index) => (
    <Box key={index} style={{ position: 'relative' }}>
      <Avatar 
        src={URL.createObjectURL(file)} 
        size={100} 
        radius="sm"
        style={{ border: '1px solid #E2E8F0' }}
      />
      <ActionIcon
        color="red"
        variant="light"
        size="sm"
        style={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}
        onClick={() => removeFile(index)}
        aria-label="Remove image"
        title="Remove image"
      >
        <IconX size={16} />
      </ActionIcon>
    </Box>
  ));





  return (
    <Tabs.Panel value="details" pt="sm">
      <Stack spacing="lg">
        <Grid gutter="xl">
          <Grid.Col sm={6}>
            <TextInput
              label="Place Name"
              placeholder="e.g., Majestic City Food Court"
              required
              size="md"
              variant="filled"
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <TextInput
              label="Address/City"
              placeholder="e.g., 123 Main Street, Colombo"
              required
              size="md"
              variant="filled"
              icon={<IconMapPin size={18} />}
              {...form.getInputProps('location')}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Google Maps Link"
          placeholder="https://maps.google.com/..."
          required
          size="md"
          variant="filled"
          description="Help others find this location easily"
          {...form.getInputProps('locationUrl')}
          onChange={(e) => {
            form.getInputProps('locationUrl').onChange(e);
            setLocationLink(e.target.value);
          }}
        />
        
        {locationLink && (
          <Anchor href={locationLink} target="_blank" size="sm">
            Test this link
          </Anchor>
        )}
        
        <TextInput
          label="Description"
          placeholder="Any additional details about this place..."
          size="md"
          variant="filled"
          description="E.g., 'Ramp is at the side entrance'"
          {...form.getInputProps('description')}
        />

        <Divider 
          my="md" 
          labelPosition="center"
          label={
            <Group spacing={6}>
              <ThemeIcon color="blue" size={24} radius="xl">
                <IconPhoto size={16} />
              </ThemeIcon>
              <Text fw={600}>Photos</Text>
            </Group>
          }
        />

        <Alert 
          icon={<IconInfoCircle size={20} />} 
          title="Photo Upload" 
          color="blue" 
          variant="light"
          radius="md"
        >
          <Text size="sm">Upload clear photos</Text>
        
         
        </Alert>
        
  <Box>
      <Dropzone
  onDrop={handleFileUpload}
  onReject={() => notifications.show({ color: 'red', title: 'Invalid files', message: `We only accept image files (JPEG, PNG) under ${MAX_SIZE_MB}MB` })}
  maxSize={MAX_SIZE_MB * 1024 ** 2}
  accept={IMAGE_MIME_TYPE}
  multiple
  radius="md"
  maxFiles={MAX_FILES}
  style={{
    width: '100%',
    padding: 24,
    border: '2px dashed #E2E8F0',
    backgroundColor: '#F8FAFC'
  }}
>
  <Group position="center" spacing="xl" style={{ minHeight: 150 }}>
    <Dropzone.Accept>
      <IconUpload size={50} stroke={1.5} color="#228be6" />
    </Dropzone.Accept>
    <Dropzone.Reject>
      <IconX size={50} stroke={1.5} color="#fa5252" />
    </Dropzone.Reject>
    <Dropzone.Idle>
      <IconPhoto size={50} stroke={1.5} />
    </Dropzone.Idle>
    <Stack spacing={4} align="center">
      <Text size="xl" fw={600} inline>Drag images here</Text>
      <Text size="sm" c="dimmed" inline>or</Text>
      <Button variant="light" color="blue" leftSection={<IconUpload size={16} /> }>
        Browse Files
      </Button>
      <Text size="xs" c="dimmed" mt={4}>
        (Max {MAX_FILES} images, {MAX_SIZE_MB}MB each)
      </Text>
    </Stack>
  </Group>
</Dropzone>
      
      {files.length > 0 && (
        <>
          <Text size="sm" color="dimmed" mt="sm">
            {files.length} of {MAX_FILES} files selected
          </Text>
          <Group spacing="sm" mt="md">
            {previews}
          </Group>
        </>
      )}
    </Box>

        <Group position="right" mt="xl">
          <Tooltip 
            label="Complete all required fields to continue" 
            disabled={form.isValid('name') && form.isValid('location') && form.isValid('locationUrl')}
            position="top"
          >
            <div>
              <Button 
                onClick={() => setActiveTab('accessibility')}
                variant="filled"
                color="blue"
                rightIcon={<IconAccessible size={18} />}
                size="md"
                disabled={!form.isValid('name') || !form.isValid('location') || !form.isValid('locationUrl')}
              >
                Continue
              </Button>
            </div>
          </Tooltip>
        </Group>
      </Stack>
    </Tabs.Panel>
  );
}

export default PlaceDetailsTab;