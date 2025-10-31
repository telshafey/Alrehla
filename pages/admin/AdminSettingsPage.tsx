import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, Image as ImageIcon, Sparkles, DollarSign } from 'lucide-react';
import { useProduct, SiteBranding } from '../../contexts/ProductContext';
import { useAdminSocialLinks, useAdminAiSettings, useAdminPricingSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

// Helper component for image upload fields
const ImageUploadField: React.FC<{
    label: string;
    fieldKey: keyof SiteBranding;
    currentUrl?: string;
    onUrlChange: (fieldKey: keyof SiteBranding, newUrl: string) => void;
}> = ({ label, fieldKey, currentUrl, onUrlChange }) => {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUrlChange(fieldKey, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <FormField label={label} htmlFor={fieldKey}>
            <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/50">
                <img 
                    src={currentUrl || "https://placehold.co/100x100/EEE/31343C?text=No+Image"} 
                    alt={`${label} Preview`} 
                    className="w-20 h-20 object-contain rounded-md bg-background" 
                />
                <div className="flex-grow">
                     <Input id={fieldKey} type="file" accept="image/*,.svg,.png" onChange={handleFileChange} />
                     {currentUrl && !currentUrl.startsWith('data:') && (
                        <p className="text-xs text-muted-foreground mt-1">
                            الرابط الحالي: <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px] inline-block align-middle">{currentUrl?.split('/').pop()}</a>
                        </p>
                     )}
                </div>
            </div>
        </FormField>
    );
};


const AdminSettingsPage: React.FC = () => {
    // Branding
    const { siteBranding: initialBranding, setSiteBranding, loading: brandingLoading } = useProduct();
    const [branding, setBranding] = useState<Partial<SiteBranding>>({});

    // Social Links
    const { data: socialLinksData, isLoading: socialsLoading, error: socialsError, refetch: refetchSocials } = useAdminSocialLinks();
    const [socials, setSocials] = useState({ facebook_url: '', twitter_url: '', instagram_url: '' });
    
    // AI Settings
    const { data: aiSettingsData, isLoading: aiSettingsLoading, error: aiError, refetch: refetchAi } = useAdminAiSettings();
    const [aiSettings, setAiSettings] = useState({ enable_story_ideas: false, story_ideas_prompt: '' });

    // Pricing Settings
    const { data: pricingSettingsData, isLoading: pricingLoading, error: pricingError, refetch: refetchPricing } = useAdminPricingSettings();
    const { updateSocialLinks, updateAiSettings, updatePricingSettings } = useSettingsMutations();
    const [pricing, setPricing] = useState({ company_percentage: 1.2, fixed_fee: 50 });


    useEffect(() => {
        if (initialBranding) setBranding(initialBranding);
    }, [initialBranding]);

    useEffect(() => {
        if (socialLinksData) setSocials(socialLinksData as any);
    }, [socialLinksData]);
    
     useEffect(() => {
        if (aiSettingsData) setAiSettings(aiSettingsData as any);
    }, [aiSettingsData]);

    useEffect(() => {
        if (pricingSettingsData) setPricing(pricingSettingsData as any);
    }, [pricingSettingsData]);

    const handleBrandingChange = (fieldKey: keyof SiteBranding, value: string) => {
        setBranding(prev => ({ ...prev, [fieldKey]: value }));
    };

    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };
    
    const handleAiSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setAiSettings(prev => ({...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    }

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPricing({ ...pricing, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleBrandingSubmit = async () => {
        await setSiteBranding(branding);
    };

    const handleSocialsSubmit = async () => {
        await updateSocialLinks.mutateAsync(socials);
    };
    
    const handleAiSettingsSubmit = async () => {
        await updateAiSettings.mutateAsync(aiSettings);
    }

    const handlePricingSubmit = async () => {
        await updatePricingSettings.mutateAsync(pricing);
    };

    const isLoading = brandingLoading || socialsLoading || aiSettingsLoading || pricingLoading;
    const error = socialsError || aiError || pricingError;
    const refetch = () => {
        if (socialsError) refetchSocials();
        if (aiError) refetchAi();
        if (pricingError) refetchPricing();
    };

    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">الإعدادات العامة للمنصة</h1>
            
            <Tabs defaultValue="branding">
                <TabsList>
                    <TabsTrigger value="branding"><ImageIcon className="ml-2" /> العلامة التجارية</TabsTrigger>
                    <TabsTrigger value="social"><LinkIcon className="ml-2" /> التواصل الاجتماعي</TabsTrigger>
                    <TabsTrigger value="ai"><Sparkles className="ml-2" /> الذكاء الاصطناعي</TabsTrigger>
                    <TabsTrigger value="pricing"><DollarSign className="ml-2" /> إعدادات التسعير</TabsTrigger>
                </TabsList>
                
                <TabsContent value="branding">
                    <Card>
                        <CardHeader>
                            <CardTitle>إدارة العلامة التجارية والصور</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <ImageUploadField label="شعار الموقع الرئيسي" fieldKey="logoUrl" currentUrl={branding.logoUrl} onUrlChange={handleBrandingChange} />
                           <ImageUploadField label="صورة الهيرو الرئيسية" fieldKey="heroImageUrl" currentUrl={branding.heroImageUrl} onUrlChange={handleBrandingChange} />
                           <ImageUploadField label="صورة صفحة 'عنا'" fieldKey="aboutImageUrl" currentUrl={branding.aboutImageUrl} onUrlChange={handleBrandingChange} />
                           <ImageUploadField label="صورة وشعار 'بداية الرحلة'" fieldKey="creativeWritingPortalImageUrl" currentUrl={branding.creativeWritingPortalImageUrl} onUrlChange={handleBrandingChange} />
                           <ImageUploadField label="صورة وشعار 'إنها لك'" fieldKey="enhaLakPortalImageUrl" currentUrl={branding.enhaLakPortalImageUrl} onUrlChange={handleBrandingChange} />
                           <div className="flex justify-end">
                                <Button onClick={handleBrandingSubmit} icon={<Save />}>حفظ إعدادات العلامة التجارية</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="social">
                     <Card>
                        <CardHeader>
                            <CardTitle>إدارة روابط التواصل الاجتماعي</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="رابط فيسبوك" htmlFor="facebook_url">
                                <Input id="facebook_url" name="facebook_url" value={socials.facebook_url || ''} onChange={handleSocialsChange} dir="ltr"/>
                            </FormField>
                             <FormField label="رابط تويتر (X)" htmlFor="twitter_url">
                                <Input id="twitter_url" name="twitter_url" value={socials.twitter_url || ''} onChange={handleSocialsChange} dir="ltr"/>
                            </FormField>
                            <FormField label="رابط انستغرام" htmlFor="instagram_url">
                                <Input id="instagram_url" name="instagram_url" value={socials.instagram_url || ''} onChange={handleSocialsChange} dir="ltr"/>
                            </FormField>
                            <div className="flex justify-end">
                                <Button onClick={handleSocialsSubmit} loading={updateSocialLinks.isPending} icon={<Save />}>حفظ الروابط</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ai">
                     <Card>
                        <CardHeader>
                            <CardTitle>إعدادات الذكاء الاصطناعي (Gemini)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                                <input type="checkbox" checked={aiSettings.enable_story_ideas} onChange={handleAiSettingsChange} name="enable_story_ideas" id="enable_story_ideas" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <label htmlFor="enable_story_ideas" className="text-sm font-medium text-foreground">تفعيل "مولّد أفكار القصص" في صفحة الطلب</label>
                            </div>
                             <FormField label="موجه الأوامر (Prompt) لمولّد الأفكار" htmlFor="story_ideas_prompt">
                                <Textarea id="story_ideas_prompt" name="story_ideas_prompt" value={aiSettings.story_ideas_prompt} onChange={handleAiSettingsChange} rows={8} />
                                <p className="text-xs text-muted-foreground mt-1">
                                    يمكنك استخدام متغيرات مثل: <code>{`\${childName}`}</code>, <code>{`\${childAge}`}</code>, <code>{`\${childTraits}`}</code>
                                </p>
                            </FormField>
                            <div className="flex justify-end">
                                <Button onClick={handleAiSettingsSubmit} loading={updateAiSettings.isPending} icon={<Save />}>حفظ إعدادات الذكاء الاصطناعي</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pricing">
                    <Card>
                        <CardHeader>
                            <CardTitle>إدارة معادلة التسعير</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">تُطبق هذه المعادلة على أسعار المدربين للوصول للسعر النهائي للعميل: <code className="font-mono bg-muted p-1 rounded-sm">السعر النهائي = (سعر المدرب * نسبة الشركة) + الرسوم الثابتة</code></p>
                            <FormField label="نسبة الشركة (مُضاعِف)" htmlFor="company_percentage">
                                <Input id="company_percentage" name="company_percentage" type="number" step="0.01" value={pricing.company_percentage || ''} onChange={handlePricingChange} />
                                <p className="text-xs text-muted-foreground mt-1">مثال: أدخل 1.2 لإضافة 20% على سعر المدرب.</p>
                            </FormField>
                            <FormField label="الرسوم الثابتة (ج.م)" htmlFor="fixed_fee">
                                <Input id="fixed_fee" name="fixed_fee" type="number" value={pricing.fixed_fee || ''} onChange={handlePricingChange} />
                            </FormField>
                            <div className="flex justify-end">
                                <Button onClick={handlePricingSubmit} loading={updatePricingSettings.isPending} icon={<Save />}>حفظ إعدادات التسعير</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );
};

export default AdminSettingsPage;