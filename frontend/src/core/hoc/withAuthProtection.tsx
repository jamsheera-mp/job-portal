import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';

const withAuthProtection = (requiredRole: 'jobSeeker' | 'recruiter') => (Component: React.FC) => {
  const ProtectedComponent: React.FC = (props) => {
    const navigate = useNavigate();
    const { isAuthenticated, role, checkAuth } = useAuth();

    useEffect(() => {
      const verifyAuth = async () => {
        if (!isAuthenticated() || role !== requiredRole) {
          const isAuth = await checkAuth();
          if (!isAuth || role !== requiredRole) {
            navigate(role !== requiredRole ? '/unauthorized' : '/login');
          }
        }
      };
      verifyAuth();
    }, [isAuthenticated, role, checkAuth, navigate]);

    return <Component {...props} />;
  };

  return ProtectedComponent;
};

export default withAuthProtection;