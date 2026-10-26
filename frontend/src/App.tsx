import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { PredictionPage } from './pages/PredictionPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { CounselorCenterPage } from './pages/CounselorCenterPage';
import { InterventionTrackingPage } from './pages/InterventionTrackingPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { PresentationModePage } from './pages/PresentationModePage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ManageUsersPage } from './pages/ManageUsersPage';

// Authentication Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { SetupAdminPage } from './pages/SetupAdminPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Standalone pages without dashboard sidebar/navbar
  const standalonePaths = [
    '/',
    '/presentation',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/access-denied',
    '/setup-admin'
  ];

  const isStandalone = standalonePaths.includes(location.pathname);

  if (isStandalone) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/presentation" element={<PresentationModePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/setup-admin" element={<SetupAdminPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background lighting */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-2/3 left-10 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-[#070B18]/70">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:studentId"
              element={
                <ProtectedRoute>
                  <StudentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/predictions"
              element={
                <ProtectedRoute>
                  <PredictionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/risk-analysis"
              element={
                <ProtectedRoute>
                  <RiskAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counselor-center"
              element={
                <ProtectedRoute allowedRoles={['Administrator', 'Counselor']}>
                  <CounselorCenterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interventions"
              element={
                <ProtectedRoute allowedRoles={['Administrator', 'Counselor']}>
                  <InterventionTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/model-insights"
              element={
                <ProtectedRoute>
                  <ModelInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all redirect to public landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
