// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminHeader from './components/Adminheader'; // New admin header (match filename)
import Footer from './components/Footer';

import MainApp from './pages/MainApp';
import AddPlace from './pages/AddPlace';
import PendingApproval from './pages/PendingApproval.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ShowPlaces from './pages/ShowPlaces.jsx';
import PendingReviews from './pages/PendingReviews.jsx';
import PendingPlaces from './pages/PendingPlaces.jsx';
import AllUsersPage from './pages/AllUser.jsx';
import UserProfile from './pages/UserProfile.jsx';

import FindDisabled from './pages/FindDisabled.jsx'; // New find disabled page
import FindCare from './pages/FindCare.jsx';
import LearnMore from './pages/LearnMore.jsx';

import MainHeader from './components/MainHeader.jsx'; // Regular site header

function App() {
  const location = useLocation();

  const showAdminHeader = location.pathname.startsWith('/admin');
  const showRegularHeader =
    !location.pathname.startsWith('/login') &&
    !location.pathname.startsWith('/register') &&
    !showAdminHeader;

  return (
    <MantineProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Conditional headers */}
        {showRegularHeader && <MainHeader />}
        {showAdminHeader && <AdminHeader />}

        <div style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/learn-more" element={<LearnMore />} />

            {/* Home Route */}
            <Route
              path="/"
              element={
                <ProtectedRoute requireApproved={false}>
                  <MainApp />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/add-place"
              element={
                <ProtectedRoute requireApproved={true}>
                  <AddPlace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/show-places"
              element={
                <ProtectedRoute>
                  <ShowPlaces />
                </ProtectedRoute>
              }
            />

            <Route
              path="/find-disabled"
              element={
                <ProtectedRoute requireApproved={true}>
                  <FindDisabled />
                </ProtectedRoute>
              }
            />

            <Route
              path="/find-care"
              element={
                <ProtectedRoute requireApproved={true}>
                  <FindCare />
                </ProtectedRoute>
              }
            />

            {/* Pending approval page */}
            <Route path="/pending" element={<PendingApproval />} />

            {/* User Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute requireAdmin>
                  <PendingReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/places"
              element={
                <ProtectedRoute requireAdmin>
                  <PendingPlaces />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/all-users"
              element={
                <ProtectedRoute requireAdmin>
                  <AllUsersPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        {/* Global Footer */}
        {showRegularHeader && <Footer />}
      </div>
    </MantineProvider>
  );
}

export default App;
