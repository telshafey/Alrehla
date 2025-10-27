

import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useProduct, SiteBranding } from '../../contexts/ProductContext';
// FIX: Corrected import path from non-existent queries.ts to adminQueries.ts
import { useAdminSocialLinks } from '../../hooks/adminQueries';
import { useSettingsMutations } from '../../hooks/mutations';
import { useToast } from '../../contexts/ToastContext';
import AdminSection from '../../components/admin/AdminSection';
import { supabase } from '../../lib/supabaseClient';
import { SocialLinks } from '../../lib/database.types';

interface ImageUploadFieldProps {
    label: string;
    currentUrl: string | null;
    onFileSelect: (file: File) => void;
    isSaving: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, currentUrl, onFileSelect, isSaving }) => {
    const [preview, setPreview] = useState<string | null>(currentUrl);

    useEffect(() => {
        setPreview(currentUrl);
    }, [currentUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    };

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {preview ? <img src={preview} alt="Preview" className="h-full w-full object-contain" /> : <ImageIcon className="text-gray-400" />}
                </div>
                <input type="file" id={label} onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={isSaving}/>
            </div>
        </div>
    );
};


const AdminSettingsPage: React.FC = () => {
    const { siteBranding, setSiteBranding, loading: productLoading } = useProduct();
    const { data: socialLinks, isLoading: adminLoading } = useAdminSocialLinks();
    const { updateSocialLinks } = useSettingsMutations();
    const { addToast } = useToast();
    
    const [isSaving, setIsSaving] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState<{ [key in keyof SiteBranding]?: File }>({});
    const [socials, setSocials] = useState<Partial<SocialLinks>>({});

    useEffect(() => {
        if(socialLinks) {
            setSocials(socialLinks);
        }
    }, [socialLinks]);
    
    const loading = productLoading || adminLoading;

    if (loading) return <Loader2 className="animate-spin" />;

    const handleFileSelect = (key: keyof SiteBranding, file: File) => {
        setFilesToUpload(prev => ({...prev, [key]: file}));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSocials(prev => ({...prev, [name]: value}));
    }

    const uploadFile = async (file: File): Promise<string> => {
        const filePath = `public/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('site_assets').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('site_assets').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Branding
            const brandingChanges: Partial<SiteBranding> = {};
            for (const key in filesToUpload) {
                const file = filesToUpload[key as keyof SiteBranding];
                if (file) {
                    const newUrl = await uploadFile(file);
                    brandingChanges[key as keyof SiteBranding] = newUrl;
                }
            }
            if(Object.keys(brandingChanges).length > 0) {
                 await setSiteBranding(brandingChanges);
            }
            setFilesToUpload({});

            // Social links
            // Correctly call the mutation function using `.mutateAsync`.
            await updateSocialLinks.mutateAsync(socials);

            addToast('تم حفظ الإعدادات بنجاح', 'success');

        } catch(err: any) {
             addToast(`فشل الحفظ: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إعدادات الموقع العامة</h1>
            <form onSubmit={handleSubmit}>
                <AdminSection title="العلامة التجارية" icon={<Settings />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadField label="الشعار الرئيسي" currentUrl={siteBranding?.logoUrl || null} onFileSelect={(file) => handleFileSelect('logoUrl', file)} isSaving={isSaving}/>
                        <ImageUploadField label="شعار بداية الرحلة" currentUrl={siteBranding?.creativeWritingLogoUrl || null} onFileSelect={(file) => handleFileSelect('creativeWritingLogoUrl', file)} isSaving={isSaving}/>
                        <ImageUploadField label="صورة الهيرو (الرئيسية)" currentUrl={siteBranding?.heroImageUrl || null} onFileSelect={(file) => handleFileSelect('heroImageUrl', file)} isSaving={isSaving}/>
                        <ImageUploadField label="صورة قسم (عنا)" currentUrl={siteBranding?.aboutImageUrl || null} onFileSelect={(file) => handleFileSelect('aboutImageUrl', file)} isSaving={isSaving}/>
                        <ImageUploadField label="صورة بوابة بداية الرحلة" currentUrl={siteBranding?.creativeWritingPortalImageUrl || null} onFileSelect={(file) => handleFileSelect('creativeWritingPortalImageUrl', file)} isSaving={isSaving}/>
                    </div>
                </AdminSection>
                
                 <AdminSection title="روابط التواصل الاجتماعي" icon={<LinkIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">رابط فيسبوك</label>
                            <input type="url" name="facebook_url" value={socials.facebook_url || ''} onChange={handleSocialChange} className="w-full p-2 border rounded-lg" />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">رابط تويتر</label>
                            <input type="url" name="twitter_url" value={socials.twitter_url || ''} onChange={handleSocialChange} className="w-full p-2 border rounded-lg" />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">رابط انستغرام</label>
                            <input type="url" name="instagram_url" value={socials.instagram_url || ''} onChange={handleSocialChange} className="w-full p-2 border rounded-lg" />
                         </div>
                    </div>
                </AdminSection>


                 <div className="flex justify-end sticky bottom-6 mt-8">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;