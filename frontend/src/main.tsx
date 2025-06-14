import { type FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store';
import HomePage from './features/home/components/HomePage';
import RegisterPage from './features/auth/components/RegisterPage';
import LoginPage from './features/auth/components/LoginPage';
import VerifyOtpPage from './features/auth/components/VerifyOtpPage';
import App from './App';
import './styles/index.css';

const Root: FC = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/job-seeker/profile" element={<div>Job Seeker Profile (Placeholder)</div>} />
          <Route path="/recruiter/profile" element={<div>Recruiter Profile (Placeholder)</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Dashboard (Placeholder)</div>} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);