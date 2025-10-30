import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, onClick }) => {
    const cardProps = {
        className: "text-right w-full transition-colors",
        ...(onClick && { as: 'button' as const, onClick, className: "text-right w-full hover:border-primary/50 hover:bg-accent transition-colors" }),
    };

    return (
        <Card {...cardProps}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
};

export default React.memo(StatCard);