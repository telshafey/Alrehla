
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
    title?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
    message, 
    onRetry, 
    title = "عذراً، حدث خطأ ما" 
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-red-50/50 rounded-2xl border border-red-100 max-w-lg mx-auto animate-fadeIn my-8">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
                {message}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {onRetry && (
                    <Button onClick={onRetry} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 gap-2">
                        <RefreshCw size={16} />
                        إعادة المحاولة
                    </Button>
                )}
                <Button as={Link} to="/" variant="ghost" className="gap-2">
                    <Home size={16} />
                    العودة للرئيسية
                </Button>
            </div>
        </div>
    );
};

export default ErrorState;
