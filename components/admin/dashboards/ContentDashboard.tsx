

import React from 'react';
import { useAdminBlogPosts } from '../../../hooks/adminQueries';
import StatCard from '../StatCard';
import PageLoader from '../../ui/PageLoader';
import { FileText, Edit3 } from 'lucide-react';

const ContentDashboard: React.FC = () => {
    const { data: blogPosts = [], isLoading, error } = useAdminBlogPosts();
    
    if (isLoading) return <PageLoader />;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">خطأ في تحميل إحصائيات المحتوى: {error.message}</div>;

    const publishedPosts = blogPosts.filter(p => p.status === 'published').length;
    const draftPosts = blogPosts.length - publishedPosts;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">ملخص المحتوى</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="مقالات منشورة" value={publishedPosts} icon={<FileText size={28} className="text-teal-500" />} color="bg-teal-100" />
                <StatCard title="مسودات" value={draftPosts} icon={<Edit3 size={28} className="text-gray-500" />} color="bg-gray-100" />
            </div>
        </div>
    );
};

export default ContentDashboard;