import React from 'react';
import AvailabilityManager from '../../components/admin/AvailabilityManager.tsx';

const AdminAvailabilityPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>
      <AvailabilityManager />
    </div>
  );
};

export default AdminAvailabilityPage;
