import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AuthGuard } from './components/AuthGuard';
import { MainLayout } from './layouts/MainLayout';
import { PublicLayout } from './layouts/PublicLayout';

// Public Pages
import { LandingPage } from './app/LandingPage';
import { LoginPage } from './app/LoginPage';
import { RegisterSchoolPage } from './app/RegisterSchoolPage';
import { TermsPage } from './app/Terms';
import { PrivacyPage } from './app/Privacy';
import { HelpPage } from './app/Help';
import { FeaturesPage } from './app/Features';
import { PricingPage } from './app/Pricing';
import { AboutPage } from './app/About';

// Private Pages
import { Dashboard } from './app/Dashboard';
import { StudentManagement } from './app/StudentManagement';
import { StudentEnrollment } from './app/StudentEnrollment';
import { AcademicConfig } from './app/AcademicConfig';
import { StaffManagement } from './app/StaffManagement';
import { StaffAdd } from './app/StaffAdd';
import { SettingsPage } from './app/SettingsPage';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterSchoolPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/help" element={<PublicLayout><HelpPage /></PublicLayout>} />
          <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <MainLayout><Dashboard /></MainLayout>
            </AuthGuard>
          } />
          
          <Route path="/students" element={
            <AuthGuard>
              <MainLayout><StudentManagement /></MainLayout>
            </AuthGuard>
          } />
          
          <Route path="/students/enroll" element={
            <AuthGuard>
              <MainLayout><StudentEnrollment /></MainLayout>
            </AuthGuard>
          } />
          
          <Route path="/academic" element={
            <AuthGuard>
              <MainLayout><AcademicConfig /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/staff" element={
            <AuthGuard>
              <MainLayout><StaffManagement /></MainLayout>
            </AuthGuard>
          } />
          
          <Route path="/staff/add" element={
            <AuthGuard>
              <MainLayout><StaffAdd /></MainLayout>
            </AuthGuard>
          } />

          {/* Settings - A-Z Working Feature */}
          <Route path="/settings" element={
            <AuthGuard>
              <MainLayout><SettingsPage /></MainLayout>
            </AuthGuard>
          } />

          {/* Generic Redirects for Coming Soon pages */}
          <Route path="/finance" element={
            <AuthGuard>
              <MainLayout><div className="p-8 text-center text-slate-500 font-medium">Finance Management Page (Coming Soon)</div></MainLayout>
            </AuthGuard>
          } />
          
          <Route path="/branches" element={
            <AuthGuard>
              <MainLayout><div className="p-8 text-center text-slate-500 font-medium">Branch Management Page (Coming Soon)</div></MainLayout>
            </AuthGuard>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
