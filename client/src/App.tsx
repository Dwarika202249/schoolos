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
import { StudentBulkImport } from './app/StudentBulkImport';
import { StudentProfileView } from './app/StudentProfileView';
import { StudentEdit } from './app/StudentEdit';
import { AcademicConfig } from './app/AcademicConfig';
import { StaffManagement } from './app/StaffManagement';
import { StaffAdd } from './app/StaffAdd';
import { StaffEdit } from './app/StaffEdit';
import { StaffProfileView } from './app/StaffProfileView';
import { SettingsPage } from './app/SettingsPage';
import { AttendanceManagement } from './app/AttendanceManagement';
import { ExamManagement } from './app/ExamManagement';
import { MarkEntry } from './app/MarkEntry';
import { BranchesPage } from './app/BranchesPage';
import { FinanceDashboard } from './app/FinanceDashboard';
import { FeeManagement } from './app/FeeManagement';
import { PayrollDashboard } from './app/PayrollDashboard';
import { InvoicesPage } from './app/InvoicesPage';
import { StaffAttendancePage } from './app/StaffAttendancePage';

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

          <Route path="/students/import" element={
            <AuthGuard>
              <MainLayout>
                <StudentBulkImport 
                  onClose={() => window.history.back()} 
                  onComplete={() => window.location.href = '/students'} 
                />
              </MainLayout>
            </AuthGuard>
          } />
          
          <Route path="/students/:id" element={
            <AuthGuard>
              <MainLayout><StudentProfileView /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/students/edit/:id" element={
            <AuthGuard>
              <MainLayout><StudentEdit /></MainLayout>
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

          <Route path="/staff/:id" element={
            <AuthGuard>
              <MainLayout><StaffProfileView /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/staff/edit/:id" element={
            <AuthGuard>
              <MainLayout><StaffEdit /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/staff/attendance" element={
            <AuthGuard>
              <MainLayout><StaffAttendancePage /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/settings" element={
            <AuthGuard>
              <MainLayout><SettingsPage /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/attendance" element={
            <AuthGuard>
              <MainLayout><AttendanceManagement /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/exams" element={
            <AuthGuard>
              <MainLayout><ExamManagement /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/exams/marking/:scheduleId" element={
            <AuthGuard>
              <MainLayout><MarkEntry /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/branches" element={
            <AuthGuard>
              <MainLayout><BranchesPage /></MainLayout>
            </AuthGuard>
          } />

          {/* Generic Redirects for Coming Soon pages */}
          <Route path="/finance" element={
            <AuthGuard>
              <MainLayout><FinanceDashboard /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/finance/fees" element={
            <AuthGuard>
              <MainLayout><FeeManagement /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/finance/invoices" element={
            <AuthGuard>
              <MainLayout><InvoicesPage /></MainLayout>
            </AuthGuard>
          } />

          <Route path="/finance/payroll" element={
            <AuthGuard>
              <MainLayout><PayrollDashboard /></MainLayout>
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
