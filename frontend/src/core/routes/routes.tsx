import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@features/home/components/HomePage';
import LoginPage from '@features/auth/components/LoginPage';
import RegisterPage from '@features/auth/components/RegisterPage';
import VerifyOtpPage from '@features/auth/components/VerifyOtpPage';
import JobSeekerProfile from '@pages/job-seeker/JobSeekerProfile';
import RecruiterProfile from '@pages/recruiter/RecruiterProfile';
import Unauthorized from '@features/auth/components/Unauthorized';
import ResetPassword from '@/features/auth/components/ResetPassword';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import Users from '@/features/admin/components/Users';
import Jobs from '@/features/admin/components/Jobs';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/job-seeker/profile" element={<JobSeekerProfile />} />
      <Route path="/recruiter/profile" element={<RecruiterProfile />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/*<Route path="/admin/dashboard" element={<div>Admin Dashboard (Placeholder)</div>} />*/}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/jobs" element={<Jobs />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;