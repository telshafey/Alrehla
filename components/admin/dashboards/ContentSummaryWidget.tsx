import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit, CheckCircle, FileText } from 'lucide-react';
import AdminSection from '../AdminSection';
import StatCard from '../StatCard';
import { Button } from '../../ui/Button';
import type { BlogPost } from '../../../lib/database.types';

const ContentSummaryWidget: React.FC<{ blogPosts: BlogPost[] }> = ({ blogPosts }) => {
    
    const { publishedCount, draftCount, recentDrafts } = useMemo(() => {
        const published = blogPosts.filter(p => p.status === 'published').length;
        const drafts = blogPosts.filter(p => p.status === 'draft');
        return {
            publishedCount: published,
            draftCount: drafts.length,
            recentDrafts: drafts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
        };
    }, [blogPosts]);

    return (
        <AdminSection title="ملخص المحتوى" icon={<Edit />}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="مقالات منشورة" value={publishedCount} icon={<CheckCircle className="text-green-500"/>} />
                    <StatCard title="مسودات" value={draftCount} icon={<FileText className="text-yellow-500"/>} />
                </div>
                 {recentDrafts.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">أحدث المسودات:</h4>
                        <div className="space-y-2">
                        {recentDrafts.map(post => (
                            <div key={post.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <p className="text-sm font-medium truncate pr-2">{post.title}</p>
                                <Button asChild variant="ghost" size="sm">
                                    <Link to="/admin/blog">تعديل</Link>
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                 <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/admin/blog">إدارة كل المقالات</Link>
                </Button>
            </div>
        </AdminSection>
    );
};

export default ContentSummaryWidget;