import React from 'react';

// This is a placeholder component. A real implementation would use a charting library like Recharts, Chart.js, etc.

interface ChartDataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: ChartDataPoint[];
    title: string;
    color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, color = 'hsl(var(--primary))' }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);
    const points = data.map((point, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (point.value / maxValue) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h3>
            <div className="h-60 bg-muted/50 rounded-lg p-4">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        points={points}
                    />
                    {data.map((point, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (point.value / maxValue) * 100;
                        return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
                    })}
                </svg>
            </div>
        </div>
    );
};

export default LineChart;
