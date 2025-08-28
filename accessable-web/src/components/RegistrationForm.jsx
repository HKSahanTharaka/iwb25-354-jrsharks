import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Anchor, Text, SegmentedControl, Stack, MultiSelect, Group, Box, Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg.png';
import { buildApiUrl } from '../config/api.js';

function RegistrationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/\d/.test(password)) {
      strength += 25;
    } else {
      feedback.push('One number');
    }

    return { strength, feedback };
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return 'red';
    if (strength < 75) return 'yellow';
    return 'green';
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      role: 'pwd',
      disabilities: [],
      traits: [],
    },
    validate: {
      username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters long';
        if (value.length > 20) return 'Username must be less than 20 characters';
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';

        // Check for uppercase letter
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';

        // Check for lowercase letter
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';

        // Check for digit
        if (!/\d/.test(value)) return 'Password must contain at least one number';

        return null;
      },
      role: (value) => {
        if (!value) return 'Please select your role';
        if (!['pwd', 'caregiver'].includes(value)) return 'Invalid role selected';
        return null;
      },
      disabilities: (value, values) => {
        if (values.role === 'pwd') {
          if (!value || value.length === 0) return 'Please select at least one disability';
        }
        return null;
      },
      traits: (value, values) => {
        if (values.role === 'caregiver') {
          if (!value || value.length === 0) return 'Please select at least one helpful trait';
        }
        return null;
      },
    },
    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  const handleSubmit = async (values) => {
    // Clear previous errors
    setRegistrationError('');

    // Validate form before submission
    const validationResult = form.validate();
    if (!validationResult.hasErrors) {
      setLoading(true);

      try {
        const registrationData = {
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          role: values.role,
          disabilities: values.role === 'pwd' ? values.disabilities : [],
          traits: values.role === 'caregiver' ? values.traits : [],
        };

        const payload = {
          action: "register",
          data: registrationData
        };

        console.log('Creating account for:', registrationData.username);
        const response = await fetch(buildApiUrl('auth'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
          throw new Error(errorData.error || `Registration failed. Please try again.`);
        }

        const result = await response.json();
        console.log('Registration successful for:', registrationData.username);

        notifications.show({
          color: 'green',
          title: 'Welcome to AccessAble!',
          message: 'Account created successfully! Redirecting to login...'
        });

        setTimeout(() => navigate('/login'), 1500);

      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'Registration failed. Please try again.';
        setRegistrationError(errorMessage);

        notifications.show({
          color: 'red',
          title: 'Registration Failed',
          message: errorMessage
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 flex">
      {/* Left side - Illustration and branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-4 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-300 rounded-full" />
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-white rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
              {/* Accessibility Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-accessibility-icon lucide-accessibility"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg>
            </div>
            <Title order={1} size="2.5rem" className="font-bold mb-4">
             You're One Step Ahead! Join <span className="text-yellow-300">AccessAble</span>
            </Title>
            <Text size="lg" className="opacity-90 leading-relaxed">
              Empowering independence and building inclusive communities across Sri Lanka
            </Text>
          </div>

          {/* Diverse accessibility community illustration */}
          <div className="relative mb-6">
            <img
              src={bgImage}
              alt="Diverse community of people with disabilities"
              className="w-full max-w-md mx-auto rounded-lg opacity-90 drop-shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-lg" />
          </div>

        
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6">
            <Title order={2} className="text-white font-bold text-2xl mb-2">
              Join <span className="text-yellow-300">AccessAble</span>
            </Title>
            <Text className="text-white/80">Create your account to get started</Text>
          </div>

          <Paper
            withBorder
            shadow="2xl"
            p={32}
            radius="xl"
            className="backdrop-blur-sm bg-white/95 border-white/20"
          >
            <div className="text-center mb-6">
              <Title order={3} className="text-gray-800 font-semibold mb-2">
                Create Account
              </Title>
              <Text size="sm" className="text-gray-600">
                Already have an account?{' '}
                <Anchor size="sm" component={Link} to="/login" className="text-blue-600 hover:text-blue-700">
                  Sign in
                </Anchor>
              </Text>
            </div>

            {registrationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text size="sm" c="red" fw={500}>
                  {registrationError}
                </Text>
              </div>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
              <TextInput
                label="Username"
                placeholder="Choose a username (3-20 characters)"
                size="md"
                radius="md"
                classNames={{
                  label: 'font-medium text-gray-700 mb-2',
                  input: 'border-gray-300 focus:border-blue-500',
                  error: 'text-red-600 text-sm mt-1'
                }}
                error={form.errors.username}
                {...form.getInputProps('username')}
              />

              <TextInput
                label="Email"
                placeholder="your.email@example.com"
                type="email"
                size="md"
                radius="md"
                classNames={{
                  label: 'font-medium text-gray-700 mb-2',
                  input: 'border-gray-300 focus:border-blue-500',
                  error: 'text-red-600 text-sm mt-1'
                }}
                error={form.errors.email}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a secure password"
                size="md"
                radius="md"
                classNames={{
                  label: 'font-medium text-gray-700 mb-2',
                  input: 'border-gray-300 focus:border-blue-500',
                  error: 'text-red-600 text-sm mt-1'
                }}
                error={form.errors.password}
                {...form.getInputProps('password')}
              />

              {/* Password Strength Indicator */}
              {form.values.password && (
                <Box mt="xs">
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" c="dimmed">Password Strength</Text>
                    <Text size="sm" fw={500} c={getPasswordStrengthColor(getPasswordStrength(form.values.password).strength)}>
                      {getPasswordStrengthLabel(getPasswordStrength(form.values.password).strength)}
                    </Text>
                  </Group>
                  <Progress
                    value={getPasswordStrength(form.values.password).strength}
                    color={getPasswordStrengthColor(getPasswordStrength(form.values.password).strength)}
                    size="sm"
                  />
                  {getPasswordStrength(form.values.password).feedback.length > 0 && (
                    <Text size="xs" c="dimmed" mt={4}>
                      Requirements: {getPasswordStrength(form.values.password).feedback.join(', ')}
                    </Text>
                  )}
                </Box>
              )}

              <Stack gap="md">
                <Text size="sm" className="font-medium text-gray-700">I am a</Text>
                <SegmentedControl
                  radius="md"
                  size="md"
                  data={[
                    { label: 'Person with Disability', value: 'pwd' },
                    { label: 'Caregiver', value: 'caregiver' },
                  ]}
                  classNames={{
                    root: 'bg-gray-100',
                    control: 'text-gray-700'
                  }}
                  error={form.errors.role}
                  {...form.getInputProps('role')}
                />
                {form.errors.role && (
                  <Text size="sm" c="red" mt={4}>
                    {form.errors.role}
                  </Text>
                )}
              </Stack>

              {form.values.role === 'pwd' && (
                <MultiSelect
                  label="Disabilities"
                  placeholder="Select all that apply (at least one required)"
                  data={[
                    'Wheelchair user',
                    'Limited mobility',
                    'Low vision',
                    'Blind',
                    'Hard of hearing',
                    'Deaf',
                    'Cognitive challenges',
                    'Autism spectrum needs',
                    'Chronic pain',
                    'Respiratory issues',
                  ]}
                  searchable
                  clearable
                  size="md"
                  radius="md"
                  classNames={{
                    label: 'font-medium text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500',
                    error: 'text-red-600 text-sm mt-1'
                  }}
                  error={form.errors.disabilities}
                  {...form.getInputProps('disabilities')}
                />
              )}

              {form.values.role === 'caregiver' && (
                <MultiSelect
                  label="Helpful traits"
                  placeholder="Select all that apply (at least one required)"
                  data={[
                    'Skilled in wheelchair handling',
                    'Trained in safe lifting/transfers',
                    'Experienced in sighted guiding',
                    'Familiar with braille/tactile support',
                    'Proficient in sign language',
                    'Experienced in non-verbal communication',
                    'Skilled in simplifying instructions',
                    'Trained in autism support',
                    'First aid & CPR certified',
                    'Knowledge of chronic condition support',
                  ]}
                  searchable
                  clearable
                  size="md"
                  radius="md"
                  classNames={{
                    label: 'font-medium text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500',
                    error: 'text-red-600 text-sm mt-1'
                  }}
                  error={form.errors.traits}
                  {...form.getInputProps('traits')}
                />
              )}

              <Button
                type="submit"
                fullWidth
                size="md"
                radius="md"
                loading={loading}
                disabled={loading || !form.isValid}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
