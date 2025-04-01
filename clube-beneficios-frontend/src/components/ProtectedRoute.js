import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const emailUsuario = localStorage.getItem('emailUsuario');

  if (!emailUsuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
