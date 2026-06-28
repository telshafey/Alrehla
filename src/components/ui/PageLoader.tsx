import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
    text?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ text = "جاري التحميل..." }) => {
    return (
        <div className="flex flex-col justify-center items-center h-full min-h-[50vh] w-full bg-gray-50">
            <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            <p className="mt-4 text-gray-600 font-semibold">{text}</p>
        </div>
    );
};

export default PageLoader;
