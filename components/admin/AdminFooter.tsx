import React from 'react';

const AdminFooter: React.FC = () => {
    return (
        <footer className="text-center text-sm text-gray-500 py-6 mt-8 border-t">
            &copy; {new Date().getFullYear()} منصة الرحلة. جميع الحقوق محفوظة.
        </footer>
    );
};

export default AdminFooter;
