import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-lg mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-red-800">حدث خطأ</h3>
            <p className="mt-2 text-sm text-red-600 max-w-md">{message}</p>
            <Button onClick={onRetry} variant="danger" className="mt-6">
                إعادة المحاولة
            </Button>
        </div>
    );
};

export default ErrorState;
