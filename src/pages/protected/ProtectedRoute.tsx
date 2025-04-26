// src/pages/protected/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to='/' />;
  }

  return children;
};

export default ProtectedRoute;