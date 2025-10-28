import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
    <button
        onClick={onClick}
        disabled={!onClick}
        className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between text-right w-full transition-transform transform hover:-translate-y-1 disabled:cursor-default disabled:transform-none disabled:hover:translate-y-0"
    >
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
    </button>
);

export default React.memo(StatCard);
