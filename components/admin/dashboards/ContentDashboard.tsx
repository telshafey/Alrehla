import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import { Edit } from 'lucide-react';

const ContentDashboard: React.FC<{ data: any }> = ({ data }) => {
    const navigate = useNavigate();
    const { blogPosts = [] } = data || {};

    const stats = useMemo(() => {
        const draftPosts = blogPosts.filter((p: any) => p.status === 'draft').length;
        const publishedPosts = blogPosts.length - draftPosts;
        return { draftPosts, publishedPosts };
    }, [blogPosts]);

    return (
        <DashboardWidget title="إدارة المحتوى" icon={<Edit className="text-green-500" />}>
            <div className="space-y-4">
                <StatCard title="مقالات منشورة" value={stats.publishedPosts} icon={<Edit size={24} className="text-green-500" />} color="bg-green-100" onClick={() => navigate('/admin/blog')} />
                <StatCard title="مسودات" value={stats.draftPosts} icon={<Edit size={24} className="text-yellow-500" />} color="bg-yellow-100" onClick={() => navigate('/admin/blog')} />
            </div>
        </DashboardWidget>
    );
};

export default ContentDashboard;
