import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import VoiceMicModal from './components/VoiceMicModal';
import EmergencyBanner from './components/EmergencyBanner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Notices from './pages/Notices';
import NoticeDetail from './pages/NoticeDetail';
import AIChatbot from './pages/AIChatbot';
import VoiceAssistant from './pages/VoiceAssistant';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Results from './pages/Results';
import Events from './pages/Events';
import Placements from './pages/Placements';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import FacultyPanel from './pages/FacultyPanel';
import Analytics from './pages/Analytics';
import AcademicCalendar from './pages/AcademicCalendar';
import Forum from './pages/Forum';
import Leaderboard from './pages/Leaderboard';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [micModalOpen, setMicModalOpen] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState({
    id: 99,
    title: '🚨 EMERGENCY ALERT: Heavy Rain Forecast - College Closed Tomorrow',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || 'student').toLowerCase();
  const defaultDashboard =
    role === 'faculty' ? '/faculty/dashboard' : role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Global Emergency Alert Banner if present */}
        {emergencyAlert && (
          <EmergencyBanner alert={emergencyAlert} onClose={() => setEmergencyAlert(null)} />
        )}

        {/* Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onMicClick={() => setMicModalOpen(true)}
        />

        {/* Page Body Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            {/* Dedicated Role-Based Dashboard Routes */}
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/faculty/dashboard" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
            <Route path="/dashboard" element={<Navigate to={defaultDashboard} replace />} />

            {/* General Routes */}
            <Route path="/notices" element={<Notices />} />
            <Route path="/notices/:id" element={<NoticeDetail />} />
            <Route path="/chatbot" element={<AIChatbot />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/results" element={<Results />} />
            <Route path="/events" element={<Events />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={role === 'admin' ? <AdminPanel /> : <Navigate to={defaultDashboard} replace />} />
            <Route path="/faculty" element={role === 'faculty' || role === 'admin' ? <FacultyPanel /> : <Navigate to={defaultDashboard} replace />} />
            <Route path="/analytics" element={role === 'admin' ? <Analytics /> : <Navigate to={defaultDashboard} replace />} />
            <Route path="/calendar" element={<AcademicCalendar />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to={defaultDashboard} replace />} />
          </Routes>
        </main>
      </div>

      {/* Voice Assistant Launcher Modal */}
      <VoiceMicModal isOpen={micModalOpen} onClose={() => setMicModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Portal Routes */}
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
