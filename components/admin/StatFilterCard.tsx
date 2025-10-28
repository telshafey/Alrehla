import React from 'react';

interface StatFilterCardProps {
    label: string;
    value: number;
    color: string;
    isActive: boolean;
    onClick: () => void;
}

const StatFilterCard: React.FC<StatFilterCardProps> = ({ label, value, color, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-4 rounded-lg text-right transition-all transform hover:-translate-y-1 ${
            isActive ? `${color} text-white shadow-lg` : 'bg-white hover:bg-gray-50 shadow-md border'
        }`}
    >
        <p className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{value}</p>
        <p className={`text-sm font-semibold ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
    </button>
);

export default StatFilterCard;