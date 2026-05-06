/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Team from './pages/public/Team';
import Schedule from './pages/public/Schedule';
import Login from './pages/public/Login';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/Overview';
import MyMeetings from './pages/dashboard/Meetings';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';

// Admin Pages
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

import AdminMeetings from './pages/admin/Meetings';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isCEO, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (isAdmin || isCEO) ? <>{children}</> : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <HashRouter>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardOverview /></PrivateRoute>} />
            <Route path="/dashboard/meetings" element={<PrivateRoute><MyMeetings /></PrivateRoute>} />
            <Route path="/dashboard/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/dashboard/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/meetings" element={<AdminRoute><AdminMeetings /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          </Routes>
        </HashRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

