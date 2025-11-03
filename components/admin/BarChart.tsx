import React from 'react';

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface BarChartProps {
    data: ChartData[];
    title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);

    return (
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h3>
            <div className="flex gap-4 items-end h-40">
                {data.map(item => (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{ 
                                height: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: item.color 
                            }}
                        ></div>
                        <div className="text-center">
                            <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-bold text-foreground">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;
