import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    onClick?: () => void;
}

const StatCard = React.forwardRef<HTMLElement, StatCardProps & React.HTMLAttributes<HTMLElement>>(
    ({ title, value, icon, onClick, className, ...props }, ref) => {
        const isButton = !!onClick;

        return (
            <Card
                ref={ref}
                as={isButton ? 'button' : 'div'}
                onClick={onClick}
                className={cn(
                    "text-right w-full transition-colors",
                    isButton && "hover:border-primary/50 hover:bg-accent transition-colors",
                    className
                )}
                {...props}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    {icon}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                </CardContent>
            </Card>
        );
    }
);
StatCard.displayName = 'StatCard';

export default React.memo(StatCard);
