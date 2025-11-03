import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminBlogPosts } from '../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { BlogPostModal } from '../../components/admin/BlogPostModal';
import { formatDate } from '../../utils/helpers';
import type { BlogPost } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import DataTable from '../../components/admin/ui/DataTable';

const AdminBlogPage: React.FC = () => {
    const { data: posts = [], isLoading, error, refetch } = useAdminBlogPosts();
    const { createBlogPost, updateBlogPost, uploadFile, bulkUpdateBlogPostsStatus, bulkDeleteBlogPosts } = useContentMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);

    const isSaving = createBlogPost.isPending || updateBlogPost.isPending || uploadFile.isPending;

    const handleOpenModal = (post: BlogPost | null) => {
        setPostToEdit(post);
        setIsModalOpen(true);
    };

    const handleSavePost = async (payload: any) => {
        try {
            let imageUrl = postToEdit?.image_url || null;
            if (payload.imageFile) {
                const uploadResult = await uploadFile.mutateAsync(payload.imageFile);
                imageUrl = uploadResult.url;
            }

            const finalPayload = { ...payload, image_url: imageUrl };
            delete finalPayload.imageFile;

            if (payload.id) {
                await updateBlogPost.mutateAsync(finalPayload);
            } else {
                await createBlogPost.mutateAsync(finalPayload);
            }
            setIsModalOpen(false);
        } catch (e) { /* Error handled in hook */ }
    };
    
    const handleDeletePost = (postId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
            bulkDeleteBlogPosts.mutate({ postIds: [postId] });
        }
    };


    if (isLoading) return <PageLoader text="جاري تحميل المقالات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <BlogPostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePost}
                post={postToEdit}
                isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة المدونة</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        مقال جديد
                    </Button>
                </div>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> قائمة المقالات</CardTitle></CardHeader>
                    <CardContent>
                       <DataTable<BlogPost>
                            data={posts}
                            columns={[
                                { accessorKey: 'title', header: 'العنوان' },
                                { 
                                    accessorKey: 'status', 
                                    header: 'الحالة',
                                    cell: ({ value }) => (
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${value === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {value === 'published' ? 'منشور' : 'مسودة'}
                                        </span>
                                    )
                                },
                                { 
                                    accessorKey: 'published_at', 
                                    header: 'تاريخ النشر',
                                    cell: ({ value }) => formatDate(value as string)
                                },
                            ]}
                             bulkActions={[
                                {
                                    label: 'نشر المحدد',
                                    action: (selected) => bulkUpdateBlogPostsStatus.mutate({ postIds: selected.map(s => s.id), status: 'published' }),
                                },
                                {
                                    label: 'تحويل إلى مسودة',
                                    action: (selected) => bulkUpdateBlogPostsStatus.mutate({ postIds: selected.map(s => s.id), status: 'draft' }),
                                },
                                {
                                    label: 'حذف المحدد',
                                    action: (selected) => {
                                        if (window.confirm(`هل أنت متأكد من حذف ${selected.length} مقالات؟`)) {
                                            bulkDeleteBlogPosts.mutate({ postIds: selected.map(s => s.id) });
                                        }
                                    },
                                    isDestructive: true,
                                }
                            ]}
                            renderRowActions={(post) => (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(post)} title="تعديل">
                                        <Edit size={18} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePost(post.id)} title="حذف">
                                        <Trash2 size={18} />
                                    </Button>
                                </>
                            )}
                       />
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminBlogPage;