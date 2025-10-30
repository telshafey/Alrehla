import React from 'react';
import { Link } from 'react-router-dom';

const AdminCreativeWritingSettingsPage: React.FC = () => {
    // This page's functionality has been split into dedicated pages for packages and services.
    // This component is kept to prevent import errors but can be removed if all imports are updated.
    return (
        <div>
            <h1>This page is deprecated.</h1>
            <p>
                Please use the new dedicated pages for managing packages and services:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                    <Link to="/admin/creative-writing-packages" className="text-blue-500 underline">Manage Packages</Link>
                </li>
                <li>
                     <Link to="/admin/creative-writing-services" className="text-blue-500 underline">Manage Services</Link>
                </li>
            </ul>
        </div>
    );
};

export default AdminCreativeWritingSettingsPage;