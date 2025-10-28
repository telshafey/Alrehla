import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import { useAdminSiteContent } from '../../hooks/adminQueries';
// FIX: Corrected import path
import { useContentMutations } from '../../hooks/mutations';
import AdminSection from '../../components/admin/AdminSection';

const AdminContentManagementPage: React.FC = () => {
    const { data, isLoading, error } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();
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
                <div className="space-y-8">
                    <AdminSection title="محتوى الصفحة الرئيسية" icon={<FileText />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الرئيسي (Hero)</label>
                                <textarea value={content.portalPage?.heroTitle || ''} onChange={(e) => handleChange('portalPage', 'heroTitle', e.target.value)} rows={2} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">النص الفرعي (Hero)</label>
                                <textarea value={content.portalPage?.heroSubtitle || ''} onChange={(e) => handleChange('portalPage', 'heroSubtitle', e.target.value)} rows={3} className="w-full p-2 border rounded-lg" />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان قسم "لماذا نحن"</label>
                                <input type="text" value={content.portalPage?.valuePropositionTitle || ''} onChange={(e) => handleChange('portalPage', 'valuePropositionTitle', e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">وصف قسم "إنها لك"</label>
                                    <textarea value={content.portalPage?.enhaLakDescription || ''} onChange={(e) => handleChange('portalPage', 'enhaLakDescription', e.target.value)} rows={2} className="w-full p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">وصف قسم "بداية الرحلة"</label>
                                    <textarea value={content.portalPage?.creativeWritingDescription || ''} onChange={(e) => handleChange('portalPage', 'creativeWritingDescription', e.target.value)} rows={2} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </AdminSection>

                    <AdminSection title="صفحة (عنا)" icon={<FileText />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">رسالتنا</label>
                                <textarea value={content.aboutPage?.missionStatement || ''} onChange={(e) => handleChange('aboutPage', 'missionStatement', e.target.value)} rows={3} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">قصتنا</label>
                                <textarea value={content.aboutPage?.ourStory || ''} onChange={(e) => handleChange('aboutPage', 'ourStory', e.target.value)} rows={4} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">رؤيتنا</label>
                                <textarea value={content.aboutPage?.ourVision || ''} onChange={(e) => handleChange('aboutPage', 'ourVision', e.target.value)} rows={3} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                    </AdminSection>

                     <AdminSection title='صفحة "إنها لك"' icon={<FileText />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الرئيسي</label>
                                <input type="text" value={content.enhaLakPage?.heroTitle || ''} onChange={(e) => handleChange('enhaLakPage', 'heroTitle', e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">النص التعريفي</label>
                                <textarea value={content.enhaLakPage?.heroSubtitle || ''} onChange={(e) => handleChange('enhaLakPage', 'heroSubtitle', e.target.value)} rows={4} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                    </AdminSection>
                    
                    <AdminSection title='صفحة "بداية الرحلة"' icon={<FileText />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الرئيسي</label>
                                <input type="text" value={content.creativeWritingPage?.heroTitle || ''} onChange={(e) => handleChange('creativeWritingPage', 'heroTitle', e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">النص التعريفي</label>
                                <textarea value={content.creativeWritingPage?.heroSubtitle || ''} onChange={(e) => handleChange('creativeWritingPage', 'heroSubtitle', e.target.value)} rows={4} className="w-full p-2 border rounded-lg" />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان قسم المنهجية</label>
                                <input type="text" value={content.creativeWritingPage?.methodologyTitle || ''} onChange={(e) => handleChange('creativeWritingPage', 'methodologyTitle', e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                    </AdminSection>
                </div>
                
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