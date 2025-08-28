import { Modal, Stack, ThemeIcon, Title, Text, Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

function SuccessAlert({ opened, onClose }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="sm"
      padding="xl"
    >
      <Stack align="center" spacing="sm" p="md">
        <ThemeIcon size={80} radius={40} variant="light" color="teal">
          <IconCheck size={48} />
        </ThemeIcon>
        <Title order={3} ta="center" mt="sm">
          Thank You!
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          Your submission helps make the world more accessible for everyone.
        </Text>
        <Button 
          onClick={onClose}
          fullWidth
          mt="md"
          size="md"
          variant="light"
          color="teal"
        >
          Done
        </Button>
      </Stack>
    </Modal>
  );
}

export default SuccessAlert;