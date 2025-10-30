import React, { useState, useEffect } from 'react';
import type { BlogPost } from '../../lib/database.types';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

interface BlogPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: {
        id?: number;
        title: string;
        slug: string;
        content: string;
        author_name: string;
        status: 'draft' | 'published';
        imageFile: File | null;
    }) => void;
    post: BlogPost | null;
    isSaving: boolean;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({ isOpen, onClose, onSave, post, isSaving }) => {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('فريق المنصة');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (post) {
                setTitle(post.title);
                setSlug(post.slug);
                setContent(post.content);
                setAuthorName(post.author_name);
                setStatus(post.status);
                setPreview(post.image_url);
            } else {
                setTitle('');
                setSlug('');
                setContent('');
                setAuthorName('فريق المنصة');
                setStatus('draft');
                setPreview(null);
            }
            setImageFile(null);
        }
    }, [post, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(post?.image_url || null);
        }
    };
    
    const generateSlug = (text: string) => {
        return text.toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!post) { // Only auto-generate slug for new posts
            setSlug(generateSlug(newTitle));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: post?.id, title, slug, content, author_name: authorName, status, imageFile });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={post ? 'تعديل المقال' : 'مقال جديد'}
            size="3xl"
            footer={
                <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                    <Button type="submit" form="blog-post-form" loading={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
                <form id="blog-post-form" onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="العنوان*" htmlFor="title">
                        <Input type="text" id="title" value={title} onChange={handleTitleChange} required />
                    </FormField>
                     <FormField label="معرّف الرابط (Slug)*" htmlFor="slug">
                        <Input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required dir="ltr" />
                    </FormField>
                    <FormField label="المحتوى* (كل فقرة في سطر)" htmlFor="content">
                        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required></Textarea>
                    </FormField>
                    <FormField label="الصورة الرئيسية" htmlFor="imageFile">
                         <div className="flex items-center gap-4">
                            {preview && <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-md bg-muted" loading="lazy" />}
                            <Input type="file" id="imageFile" onChange={handleFileChange} accept="image/*" />
                        </div>
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <FormField label="الكاتب" htmlFor="authorName">
                            <Input type="text" id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
                        </FormField>
                        <FormField label="الحالة" htmlFor="status">
                            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
                                <option value="draft">مسودة</option>
                                <option value="published">منشور</option>
                            </Select>
                        </FormField>
                    </div>
                </form>
        </Modal>
    );
};