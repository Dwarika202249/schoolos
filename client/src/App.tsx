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

// Private Pages
import { Dashboard } from './app/Dashboard';
import { StudentManagement } from './app/StudentManagement';
import { StudentEnrollment } from './app/StudentEnrollment';
import { AcademicConfig } from './app/AcademicConfig';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterSchoolPage /></PublicLayout>} />

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

          {/* Generic Redirects */}
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
          
          <Route path="/settings" element={
            <AuthGuard>
              <MainLayout><div className="p-8 text-center text-slate-500 font-medium">Settings Page (Coming Soon)</div></MainLayout>
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
