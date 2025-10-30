import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface AdminSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const AdminSection: React.FC<AdminSectionProps> = ({ title, icon, children }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
};

export default AdminSection;