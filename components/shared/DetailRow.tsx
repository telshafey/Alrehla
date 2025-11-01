import React from 'react';

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
    isTextArea?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, isTextArea = false }) => (
    <div className="py-2 first:pt-0 last:pb-0">
        <p className="text-sm font-semibold text-muted-foreground">{label}:</p>
        {isTextArea ? (
            <div className="text-foreground mt-1 whitespace-pre-wrap bg-muted/50 p-2 rounded-lg">{value || 'N/A'}</div>
        ) : (
            <p className="text-foreground font-medium">{value || 'N/A'}</p>
        )}
    </div>
);

export default DetailRow;
