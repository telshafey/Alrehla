import React, { useState, useMemo } from 'react';
import { Edit, Plus, Edit2, Trash2, CheckCircle, FileText } from 'lucide-react';
import { useAdminBlogPosts } from '../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { BlogPostModal } from '../../components/admin/BlogPostModal';
import { Button } from '../../components/ui/Button';
import type { BlogPost } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import ErrorState from '../../components/ui/ErrorState';
import StatCard from '../../components/admin/StatCard';
import BarChart from '../../components/admin/BarChart';
import { Select } from '../../components/ui/Select';

type PostStatus = 'published' | 'draft';

const AdminBlogPage: React.FC = () => {
    const { data: posts = [], isLoading, error, refetch } = useAdminBlogPosts();
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
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

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
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة المدونة</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        مقال جديد
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>ملخص المدونة</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-4 lg:col-span-1">
                            <StatCard title="إجمالي المقالات" value={posts.length} icon={<Edit className="h-4 w-4 text-muted-foreground"/>} />
                            <StatCard title="مقالات منشورة" value={statusCounts.published} icon={<CheckCircle className="h-4 w-4 text-green-500"/>} />
                            <StatCard title="مسودات" value={statusCounts.draft} icon={<FileText className="h-4 w-4 text-yellow-500"/>} />
                        </div>
                        <div className="lg:col-span-2">
                             <BarChart 
                                title="المنشور مقابل المسودات"
                                data={[
                                    { label: 'منشور', value: statusCounts.published, color: 'hsl(var(--primary))' },
                                    { label: 'مسودة', value: statusCounts.draft, color: 'hsl(var(--muted))' }
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Edit /> قائمة المقالات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <Input 
                                type="search"
                                placeholder="ابحث بالعنوان..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="max-w-lg"
                            />
                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                                <option value="all">كل الحالات</option>
                                <option value="published">منشور</option>
                                <option value="draft">مسودة</option>
                            </Select>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                        <TableHead>العنوان</TableHead>
                                        <TableHead>الكاتب</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>تاريخ النشر</TableHead>
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPosts.map(post => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-semibold">{post.title}</TableCell>
                                            <TableCell>{post.author_name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {post.status === 'published' ? 'منشور' : 'مسودة'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(post.published_at)}</TableCell>
                                            <TableCell className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(post)} title="تعديل"><Edit2 size={20} /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePost(post.id)} title="حذف"><Trash2 size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {filteredPosts.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد مقالات تطابق بحثك.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminBlogPage;