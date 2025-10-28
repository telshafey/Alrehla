import React, { useState, useMemo } from 'react';
import { Edit, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminBlogPosts } from '../../hooks/adminQueries';
// FIX: Corrected import path
import { useContentMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { BlogPostModal } from '../../components/admin/BlogPostModal';
import { Button } from '../../components/ui/Button';
import type { BlogPost } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';

type PostStatus = 'published' | 'draft';

const AdminBlogPage: React.FC = () => {
    const { data: posts = [], isLoading, error } = useAdminBlogPosts();
    const { createBlogPost, updateBlogPost, deleteBlogPost } = useContentMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const isSaving = createBlogPost.isPending || updateBlogPost.isPending;

    const statusCounts = useMemo(() => {
        return {
            published: posts.filter(p => p.status === 'published').length,
            draft: posts.filter(p => p.status === 'draft').length,
        };
    }, [posts]);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
            const matchesSearch = searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [posts, statusFilter, searchTerm]);

    const handleOpenModal = (post: BlogPost | null) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleSavePost = async (payload: any) => {
        try {
            if (payload.id) {
                await updateBlogPost.mutateAsync(payload);
            } else {
                await createBlogPost.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) { /* Error handled by hook */ }
    };

    const handleDeletePost = async (postId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
            await deleteBlogPost.mutateAsync({ postId });
        }
    };
    
    if (isLoading) return <PageLoader text="جاري تحميل المدونة..." />;
    if (error) return <div className="text-red-500">{(error as Error).message}</div>;

    return (
        <>
            <BlogPostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePost}
                post={selectedPost}
                isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المدونة</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        مقال جديد
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatFilterCard label="الكل" value={posts.length} color="bg-gray-800" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                    <StatFilterCard label="منشور" value={statusCounts.published} color="bg-green-500" isActive={statusFilter === 'published'} onClick={() => setStatusFilter('published')} />
                    <StatFilterCard label="مسودة" value={statusCounts.draft} color="bg-yellow-500" isActive={statusFilter === 'draft'} onClick={() => setStatusFilter('draft')} />
                </div>

                <AdminSection title="قائمة المقالات" icon={<Edit />}>
                    <div className="mb-6 max-w-lg">
                        <Input 
                            type="search"
                            placeholder="ابحث بالعنوان..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">العنوان</th><th className="p-3">الكاتب</th><th className="p-3">الحالة</th><th className="p-3">تاريخ النشر</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredPosts.map(post => (
                                    <tr key={post.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{post.title}</td>
                                        <td className="p-3">{post.author_name}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {post.status === 'published' ? 'منشور' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm">{formatDate(post.published_at)}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(post)}><Edit2 size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeletePost(post.id)}><Trash2 size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredPosts.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد مقالات تطابق بحثك.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminBlogPage;