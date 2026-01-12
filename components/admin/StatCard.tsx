
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
                    "text-right w-full transition-all duration-200 overflow-hidden relative group",
                    "border-l-4 hover:shadow-md bg-white",
                    isButton && "hover:scale-[1.02] cursor-pointer",
                    className
                )}
                {...props}
            >
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-full -translate-x-10 -translate-y-10 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                    <div className="p-2 bg-gray-50 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {icon}
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                        {value}
                    </div>
                </CardContent>
            </Card>
        );
    }
);
StatCard.displayName = 'StatCard';

export default React.memo(StatCard);
