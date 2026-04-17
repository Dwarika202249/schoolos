import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './app/Dashboard';
import { StudentManagement } from './app/StudentManagement';
import { StudentEnrollment } from './app/StudentEnrollment';
import { AcademicConfig } from './app/AcademicConfig';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/students/enroll" element={<StudentEnrollment />} />
          <Route path="/academic" element={<AcademicConfig />} />
          <Route path="/finance" element={<div className="p-8 text-center text-slate-500 font-medium">Finance Management Page (Coming Soon)</div>} />
          <Route path="/branches" element={<div className="p-8 text-center text-slate-500 font-medium">Branch Management Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-8 text-center text-slate-500 font-medium">Settings Page (Coming Soon)</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
