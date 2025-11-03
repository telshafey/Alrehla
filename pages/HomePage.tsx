import React from 'react';
import { Navigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  // The PortalPage at '/' serves as the main home page.
  // This component redirects the legacy '/home' route to the root path.
  return <Navigate to="/" replace />;
};

export default HomePage;
