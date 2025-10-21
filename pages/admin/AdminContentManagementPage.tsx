import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import { useAdminSiteContent } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import AdminSection from '../../components/admin/AdminSection.tsx';

const AdminContentManagementPage: React.FC = () => {
    const { data, isLoading, error } = useAdminSiteContent();
    const { updateSiteContent } = useAppMutations();
    const [content, setContent] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (data) {
            setContent(JSON.parse(JSON.stringify(data)));
        }
    }, [data]);

    const handleChange = (section: string, field: string, value: string) => {
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Correctly call the mutation function using `.mutateAsync`.
            await updateSiteContent.mutateAsync(content);
        } catch (err) {
            // Error handled in hook
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !content) return <Loader2 className="animate-spin mx-auto" />;
    if (error) return <div className="text-red-500">{error.message}</div>;

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة محتوى الموقع</h1>
            <form onSubmit={handleSubmit}>
                <AdminSection title="صفحة (عنا)" icon={<FileText />}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">النص التعريفي (في الصفحة الرئيسية)</label>
                            <textarea
                                value={content.about?.intro_text || ''}
                                onChange={(e) => handleChange('about', 'intro_text', e.target.value)}
                                rows={4}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">عنوان البطل (صفحة عنا)</label>
                            <input
                                type="text"
                                value={content.about?.hero_title || ''}
                                onChange={(e) => handleChange('about', 'hero_title', e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">النص الفرعي للبطل (صفحة عنا)</label>
                            <textarea
                                value={content.about?.hero_subtitle || ''}
                                onChange={(e) => handleChange('about', 'hero_subtitle', e.target.value)}
                                rows={2}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        {/* Add more fields here */}
                    </div>
                </AdminSection>
                
                 <div className="flex justify-end sticky bottom-6 mt-8">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ المحتوى'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminContentManagementPage;
