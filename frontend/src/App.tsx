import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

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

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Standalone pages that don't need the dashboard sidebar/navbar
  const isLanding = location.pathname === '/';
  const isPresentation = location.pathname === '/presentation';

  if (isLanding) {
    return <LandingPage />;
  }

  if (isPresentation) {
    return <PresentationModePage />;
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:studentId" element={<StudentDetailPage />} />
            <Route path="/predictions" element={<PredictionPage />} />
            <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
            <Route path="/counselor-center" element={<CounselorCenterPage />} />
            <Route path="/interventions" element={<InterventionTrackingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/model-insights" element={<ModelInsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
