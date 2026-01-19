import React from 'react';
import { Navigate } from 'react-router-dom';
import { isOwnerAuthenticated } from '../utils/ownerAuth';

function OwnerPrivateRoute({ children }) {
  return isOwnerAuthenticated() ? children : <Navigate to="/owner/login" />;
}

export default OwnerPrivateRoute;
