import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import { FileText, Edit } from 'lucide-react';

interface ContentDashboardProps {
    data: any;
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { blogPosts = [] } = data || {};
    
    const stats = useMemo(() => {
        const publishedPosts = blogPosts.filter((p: any) => p.status === 'published').length;
        const draftPosts = blogPosts.filter((p: any) => p.status === 'draft').length;

        return { publishedPosts, draftPosts };
    }, [blogPosts]);

    return (
        <DashboardWidget title="ملخص المحتوى" icon={<FileText className="text-green-500" />}>
            <div className="space-y-4">
                <StatCard 
                    title="مقالات منشورة" 
                    value={stats.publishedPosts} 
                    icon={<FileText size={24} className="text-green-500" />} 
                    color="bg-green-100"
                    onClick={() => navigate('/admin/blog')}
                />
                 <StatCard 
                    title="مسودات تنتظر النشر" 
                    value={stats.draftPosts} 
                    icon={<Edit size={24} className="text-yellow-500" />} 
                    color="bg-yellow-100"
                    onClick={() => navigate('/admin/blog')}
                />
            </div>
        </DashboardWidget>
    );
};

export default ContentDashboard;
