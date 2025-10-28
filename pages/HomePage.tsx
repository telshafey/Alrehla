import React from 'react';
import { Navigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  // The main landing page is now PortalPage, so we redirect there.
  return <Navigate to="/" replace />;
};

export default HomePage;
