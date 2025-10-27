

import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminBlogPosts } from '../../hooks/adminQueries';
import { useContentMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
// FIX: Changed to a named import to resolve the "no default export" error.
import { BlogPostModal } from '../../components/admin/BlogPostModal';
import { formatDate } from '../../utils/helpers';
import type { BlogPost } from '../../lib/database.types';

const AdminBlogPage: React.FC = () => {
    const { data: blogPosts = [], isLoading, error } = useAdminBlogPosts();
    const { createBlogPost, updateBlogPost, deleteBlogPost } = useContentMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = (post: BlogPost | null) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleSavePost = async (payload: any) => {
        setIsSaving(true);
        try {
            if (payload.id) {
                await updateBlogPost.mutateAsync(payload);
            } else {
                await createBlogPost.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) {
            // Error handled in hook
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeletePost = async (postId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
            await deleteBlogPost.mutateAsync({ postId });
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل المدونة..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <>
            <BlogPostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePost}
                post={selectedPost}
                isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المدونة</h1>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                        <Plus size={18} /><span>مقال جديد</span>
                    </button>
                </div>

                <AdminSection title="كل المقالات" icon={<FileText />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">العنوان</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3">تاريخ النشر</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogPosts.map(post => (
                                    <tr key={post.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{post.title}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {post.status === 'published' ? 'منشور' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="p-3">{post.published_at ? formatDate(post.published_at) : '-'}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <button onClick={() => handleOpenModal(post)} className="text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
                                            <button onClick={() => handleDeletePost(post.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={20} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminBlogPage;