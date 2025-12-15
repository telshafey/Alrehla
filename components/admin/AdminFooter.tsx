
import React from 'react';

const AdminFooter: React.FC = () => {
    return (
        <footer className="text-center text-sm text-gray-500 py-6 mt-auto border-t bg-background z-10 relative">
            &copy; {new Date().getFullYear()} منصة الرحلة. جميع الحقوق محفوظة.
        </footer>
    );
};

export default AdminFooter;
