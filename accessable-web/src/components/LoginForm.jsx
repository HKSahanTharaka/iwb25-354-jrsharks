import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Paper, Title, Anchor, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import bgImage from '../assets/bg.png';
import { buildApiUrl } from '../config/api.js';

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters long';
        return null;
      },
    },
    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  const handleSubmit = async (values) => {
    // Clear previous errors
    setLoginError('');

    // Validate form before submission
    const validationResult = form.validate();
    if (!validationResult.hasErrors) {
      setLoading(true);

      try {
        const payload = {
          action: "login",
          data: values
        };

        console.log('Attempting login for:', values.email);
        const response = await fetch(buildApiUrl('auth'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
          throw new Error(errorData.error || 'Login failed. Please check your credentials.');
        }

        const result = await response.json();
        console.log('Login successful:', result.user?.username || 'User');

        if (result.token && result.user) {
          login(result.token, result.user);

          notifications.show({
            color: 'green',
            title: 'Welcome back!',
            message: `Login successful! Redirecting to dashboard...`
          });

          // Navigate based on user role
          if (result.user.role?.toLowerCase().trim() === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          throw new Error('Invalid response from server');
        }

      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.message || 'Login failed. Please try again.';
        setLoginError(errorMessage);

        notifications.show({
          color: 'red',
          title: 'Login Failed',
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-300 rounded-full" />
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-white rounded-full" />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-accessibility">
                <circle cx="16" cy="4" r="1"/>
                <path d="m18 19 1-7-6 1"/>
                <path d="m5 8 3-3 5.5 3-2.36 3.5"/>
                <path d="M4.24 14.5a5 5 0 0 0 6.88 6"/>
                <path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>
              </svg>
            </div>
            <Title order={1} size="2.5rem" className="font-bold mb-4">
              Welcome to <span className="text-yellow-300">AccessAble</span>
            </Title>
            <Text size="lg" className="opacity-90 leading-relaxed">
              Empowering independence and building inclusive communities across Sri Lanka
            </Text>
          </div>

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

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-6">
            <Title order={2} className="text-white font-bold text-2xl mb-2">
              Welcome to <span className="text-yellow-300">AccessAble</span>
            </Title>
            <Text className="text-white/80">Sign in to your account</Text>
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
                Sign In
              </Title>
              <Text size="sm" className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Anchor size="sm" component={Link} to="/register" className="text-blue-600 hover:text-blue-700">
                  Create account
                </Anchor>
              </Text>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text size="sm" c="red" fw={500}>
                  {loginError}
                </Text>
              </div>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
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
                placeholder="Your password"
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

              <Button
                type="submit"
                fullWidth
                size="md"
                radius="md"
                loading={loading}
                disabled={loading || !form.isValid}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;