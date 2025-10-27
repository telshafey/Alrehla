

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
// FIX: Remove .ts extension from import paths
import type { BlogPost } from '../../lib/database.types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

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

// FIX: Changed to a named export to resolve module resolution issues.
export const BlogPostModal: React.FC<BlogPostModalProps> = ({ isOpen, onClose, onSave, post, isSaving }) => {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('فريق المنصة');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

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

    if (!isOpen) return null;

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
        // FIX: Removed redundant .toString() call on a string.
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="blog-post-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="blog-post-modal-title" className="text-2xl font-bold text-gray-800">{post ? 'تعديل المقال' : 'مقال جديد'}</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">العنوان*</label>
                        <input type="text" id="title" value={title} onChange={handleTitleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div>
                        <label htmlFor="slug" className="block text-sm font-bold text-gray-700 mb-2">معرّف الرابط (Slug)*</label>
                        <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" required dir="ltr" />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">المحتوى* (كل فقرة في سطر)</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={10} required></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الصورة الرئيسية</label>
                         <div className="flex items-center gap-4">
                            {preview && <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-md bg-gray-200" loading="lazy" />}
                            <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="authorName" className="block text-sm font-bold text-gray-700 mb-2">الكاتب</label>
                            <input type="text" id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                <option value="draft">مسودة</option>
                                <option value="published">منشور</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
