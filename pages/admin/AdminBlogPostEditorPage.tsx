
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Calendar, User, Image as ImageIcon, Type, Globe, FileText } from 'lucide-react';
import { useAdminBlogPosts } from '../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import ImageUploadField from '../../components/admin/ui/ImageUploadField';
import type { BlogPost } from '../../lib/database.types';

const AdminBlogPostEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: posts = [], isLoading: postsLoading } = useAdminBlogPosts();
    const { createBlogPost, updateBlogPost } = useContentMutations();

    const [post, setPost] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        content: '',
        author_name: 'فريق المنصة',
        status: 'draft',
        image_url: null,
        published_at: null
    });

    useEffect(() => {
        if (!isNew && posts.length > 0) {
            const existingPost = posts.find(p => p.id === Number(id));
            if (existingPost) {
                setPost(existingPost);
            } else if (!postsLoading) {
                navigate('/admin/blog');
            }
        }
    }, [id, isNew, posts, postsLoading, navigate]);

    const generateSlug = (text: string) => {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '') 
            .replace(/\s+/g, '-')     
            .replace(/\-\-+/g, '-')   
            .trim();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPost(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'title' && isNew) {
                newState.slug = generateSlug(value);
            }
            return newState;
        });
    };

    const handleImageChange = (key: string, url: string) => {
        setPost(prev => ({ ...prev, image_url: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalPost = { ...post };
        if (finalPost.status === 'published' && !finalPost.published_at) {
            finalPost.published_at = new Date().toISOString();
        }

        try {
            if (isNew) {
                await createBlogPost.mutateAsync(finalPost);
            } else {
                await updateBlogPost.mutateAsync(finalPost);
            }
            navigate('/admin/blog');
        } catch (error) {
            console.error("Failed to save post", error);
        }
    };

    const isSaving = createBlogPost.isPending || updateBlogPost.isPending;
    const wordCount = post.content?.split(/\s+/).filter(Boolean).length || 0;
    const readTime = Math.ceil(wordCount / 200); 

    if (postsLoading && !isNew) return <PageLoader text="جاري تحميل المقال..." />;

    return (
        <div className="animate-fadeIn space-y-6 pb-20">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-20 bg-background/95 backdrop-blur p-4 border-b -mx-6 px-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/admin/blog" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="transform rotate-180" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground line-clamp-1">
                            {isNew ? 'كتابة مقال جديد' : `تعديل: ${post.title}`}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={`inline-block w-2 h-2 rounded-full ${post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span>{post.status === 'published' ? 'منشور' : 'مسودة'}</span>
                            <span>•</span>
                            <span>{wordCount} كلمة</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="button" variant="outline" className="flex-1 sm:flex-none" icon={<Eye size={16}/>} onClick={() => window.open(`#/blog/${post.slug || ''}`, '_blank')}>
                        معاينة
                    </Button>
                    <Button type="submit" form="blog-form" loading={isSaving} className="flex-1 sm:flex-none" icon={<Save size={16}/>}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ ونشر'}
                    </Button>
                </div>
            </div>

            <form id="blog-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Type /> المحتوى الرئيسي</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField label="عنوان المقال" htmlFor="title">
                                <Input id="title" name="title" value={post.title} onChange={handleChange} required placeholder="اكتب عنواناً جذاباً..." className="text-lg font-bold py-6" />
                            </FormField>
                            
                            <FormField label="نص المقال" htmlFor="content">
                                <div className="relative">
                                    <Textarea 
                                        id="content" 
                                        name="content" 
                                        value={post.content} 
                                        onChange={handleChange} 
                                        rows={20} 
                                        required 
                                        placeholder="اكتب محتوى المقال هنا... يمكنك استخدام Markdown بسيط." 
                                        className="font-serif text-lg leading-relaxed min-h-[500px] p-6"
                                    />
                                    <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 rounded">
                                        {readTime} دقيقة قراءة
                                    </div>
                                </div>
                            </FormField>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Save size={18} /> إعدادات النشر</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="الحالة" htmlFor="status">
                                <Select id="status" name="status" value={post.status} onChange={handleChange}>
                                    <option value="draft">مسودة (غير منشور)</option>
                                    <option value="published">منشور</option>
                                </Select>
                            </FormField>
                            
                            <FormField label="الكاتب" htmlFor="author_name">
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <Input id="author_name" name="author_name" value={post.author_name} onChange={handleChange} className="pr-10" />
                                </div>
                            </FormField>

                            {post.published_at && (
                                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>نُشر في: {new Date(post.published_at).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><ImageIcon size={18} /> الصورة البارزة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploadField 
                                label="صورة الغلاف" 
                                fieldKey="image_url" 
                                currentUrl={post.image_url || ''} 
                                onUrlChange={handleImageChange}
                                recommendedSize="1200x630px"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Globe size={18} /> تحسين محركات البحث (SEO)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField label="الرابط الدائم (Slug)" htmlFor="slug">
                                <Input id="slug" name="slug" value={post.slug} onChange={handleChange} dir="ltr" className="font-mono text-sm" />
                                <p className="text-[10px] text-muted-foreground mt-1 truncate" dir="ltr">
                                    .../blog/{post.slug}
                                </p>
                            </FormField>
                            <div className="p-3 bg-blue-50 rounded text-xs text-blue-700">
                                <p className="font-bold mb-1">معاينة النتيجة في جوجل:</p>
                                <p className="text-blue-800 text-sm font-semibold truncate">{post.title || 'عنوان المقال'}</p>
                                <p className="text-green-700 truncate" dir="ltr">alrehla.com/blog/{post.slug}</p>
                                <p className="text-gray-600 line-clamp-2">{post.content?.substring(0, 150)}...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default AdminBlogPostEditorPage;
