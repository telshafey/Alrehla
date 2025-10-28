import React from 'react';

interface DashboardWidgetProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, icon, children }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                {icon}
                {title}
            </h2>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md">
                {children}
            </div>
        </div>
    );
};

export default DashboardWidget;
