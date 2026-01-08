
import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, DollarSign, Shield, Mail, Layout } from 'lucide-react';
import { useProduct, SiteBranding } from '../../contexts/ProductContext';
import { useAdminSocialLinks, useAdminPricingSettings, useAdminCommunicationSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import PermissionsManager from '../../components/admin/PermissionsManager';
import ImageUploadField from '../../components/admin/ui/ImageUploadField';

const AdminSettingsPage: React.FC = () => {
    const { siteBranding: initialBranding, setSiteBranding, loading: brandingLoading } = useProduct();
    const [branding, setBranding] = useState<Partial<SiteBranding>>({});

    const { data: siteContent, isLoading: contentLoading } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();
    const [contentImages, setContentImages] = useState({ cwPhilosophy: '' });

    const { data: commsData, isLoading: commsLoading } = useAdminCommunicationSettings();
    const [commSettings, setCommSettings] = useState({ support_email: '', join_us_email: '', whatsapp_number: '', whatsapp_default_message: '', instapay_url: '', instapay_qr_url: '', instapay_number: '' });
    
    const { data: socialLinksData, isLoading: socialsLoading } = useAdminSocialLinks();
    const [socials, setSocials] = useState({ facebook_url: '', twitter_url: '', instagram_url: '' });
    
    const { data: pricingSettingsData, isLoading: pricingLoading } = useAdminPricingSettings();
    const { updateSocialLinks, updateCommunicationSettings, updatePricingSettings } = useSettingsMutations();
    const [pricing, setPricing] = useState({ company_percentage: 1.2, fixed_fee: 50 });

    useEffect(() => {
        if (initialBranding) setBranding(initialBranding);
    }, [initialBranding]);

    useEffect(() => {
        if (siteContent) {
            setContentImages({ cwPhilosophy: siteContent.creativeWritingPage?.about?.heroImageUrl || '' });
        }
    }, [siteContent]);
    
    useEffect(() => {
        if (commsData) setCommSettings(commsData as any);
    }, [commsData]);

    useEffect(() => {
        if (socialLinksData) setSocials(socialLinksData as any);
    }, [socialLinksData]);
    
    useEffect(() => {
        if (pricingSettingsData) setPricing(pricingSettingsData as any);
    }, [pricingSettingsData]);

    const handleBrandingChange = (fieldKey: string, value: string) => {
        setBranding(prev => ({ ...prev, [fieldKey]: value }));
    };

    const handleImagesSubmit = async () => {
        const promises = [setSiteBranding(branding)];
        if (siteContent) {
            const newContent = JSON.parse(JSON.stringify(siteContent));
            if (!newContent.creativeWritingPage) newContent.creativeWritingPage = { about: {} };
            if (!newContent.creativeWritingPage.about) newContent.creativeWritingPage.about = {};
            newContent.creativeWritingPage.about.heroImageUrl = contentImages.cwPhilosophy;
            promises.push(updateSiteContent.mutateAsync(newContent));
        }
        await Promise.all(promises);
    };

    const handleCommunicationSubmit = async () => {
        await updateCommunicationSettings.mutateAsync(commSettings);
        await updateSocialLinks.mutateAsync(socials);
    };
    
    const handlePricingSubmit = async () => {
        await updatePricingSettings.mutateAsync(pricing);
    };

    const isLoading = brandingLoading || socialsLoading || pricingLoading || commsLoading || contentLoading;
    if (isLoading) return <PageLoader />;

    return (
        <div className="animate-fadeIn space-y-8 w-full max-w-full overflow-x-hidden pb-20">
            <h1 className="text-3xl font-extrabold text-foreground">الإعدادات العامة للمنصة</h1>
            
            <Tabs defaultValue="branding">
                <TabsList className="bg-muted p-1 rounded-xl">
                    <TabsTrigger value="branding"><ImageIcon className="ml-2 w-4 h-4" /> هوية الموقع</TabsTrigger>
                    <TabsTrigger value="communication"><Mail className="ml-2 w-4 h-4" /> التواصل والروابط</TabsTrigger>
                    <TabsTrigger value="pricing"><DollarSign className="ml-2 w-4 h-4" /> إعدادات الماليات</TabsTrigger>
                    <TabsTrigger value="permissions"><Shield className="ml-2 w-4 h-4" /> صلاحيات الأدوار</TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-6 animate-fadeIn">
                    {/* المجموعة 1: الهوية الأساسية */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">الهوية البصرية الأساسية</CardTitle>
                            <CardDescription>الشعار والصور الرئيسية للمنصة.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ImageUploadField 
                                label="شعار المنصة (Logo)" 
                                fieldKey="logoUrl" 
                                currentUrl={branding.logoUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="500x150px" 
                            />
                            <ImageUploadField 
                                label="خلفية الهيرو الرئيسية (Hero)" 
                                fieldKey="heroImageUrl" 
                                currentUrl={branding.heroImageUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="1920x800px"
                            />
                        </CardContent>
                    </Card>

                    {/* المجموعة 2: صور الصفحات التعريفية */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">صور الصفحات التعريفية</CardTitle>
                            <CardDescription>الصور التي تظهر في الأجزاء العلوية (Hero) للصفحات الداخلية.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ImageUploadField 
                                label="خلفية صفحة رحلتنا (About Page)" 
                                fieldKey="aboutHeroImageUrl" 
                                currentUrl={branding.aboutHeroImageUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="1920x600px"
                            />
                            <ImageUploadField 
                                label="خلفية صفحة انضم إلينا (Join Us)" 
                                fieldKey="joinUsImageUrl" 
                                currentUrl={branding.joinUsImageUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="1920x600px"
                            />
                        </CardContent>
                    </Card>

                    {/* المجموعة 3: صور بطاقات الأقسام (Home Portal) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">صور بطاقات الأقسام (الرئيسية)</CardTitle>
                            <CardDescription>الصور التي تظهر في بطاقات التوجيه للمشاريع في الصفحة الرئيسية.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ImageUploadField 
                                label="بطاقة 'إنها لك'" 
                                fieldKey="enhaLakPortalImageUrl" 
                                currentUrl={branding.enhaLakPortalImageUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="600x400px"
                            />
                            <ImageUploadField 
                                label="بطاقة 'بداية الرحلة'" 
                                fieldKey="creativeWritingPortalImageUrl" 
                                currentUrl={branding.creativeWritingPortalImageUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="600x400px"
                            />
                            <ImageUploadField 
                                label="بطاقة 'قصتنا' (عنا)" 
                                fieldKey="aboutPortalImageUrl" 
                                currentUrl={branding.aboutPortalImageUrl} 
                                onUrlChange={handleBrandingChange} 
                                recommendedSize="600x600px"
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end sticky bottom-4 z-10">
                        <Button onClick={handleImagesSubmit} size="lg" className="shadow-2xl" icon={<Save />}>
                            حفظ كافة تغييرات الصور
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="communication" className="space-y-6 animate-fadeIn">
                    <Card>
                        <CardHeader><CardTitle>روابط التواصل الاجتماعي</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="رابط فيسبوك" htmlFor="facebook_url"><Input id="facebook_url" value={socials.facebook_url} onChange={(e) => setSocials({...socials, facebook_url: e.target.value})} dir="ltr" placeholder="https://facebook.com/..." /></FormField>
                            <FormField label="رابط تويتر (X)" htmlFor="twitter_url"><Input id="twitter_url" value={socials.twitter_url} onChange={(e) => setSocials({...socials, twitter_url: e.target.value})} dir="ltr" placeholder="https://twitter.com/..." /></FormField>
                            <FormField label="رابط انستجرام" htmlFor="instagram_url"><Input id="instagram_url" value={socials.instagram_url} onChange={(e) => setSocials({...socials, instagram_url: e.target.value})} dir="ltr" placeholder="https://instagram.com/..." /></FormField>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>بيانات التحويل المالي (Instapay)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="رقم الهاتف المرتبط بـ Instapay" htmlFor="instapay_number"><Input id="instapay_number" value={commSettings.instapay_number} onChange={(e) => setCommSettings({...commSettings, instapay_number: e.target.value})} dir="ltr" /></FormField>
                            <FormField label="رابط الدفع السريع" htmlFor="instapay_url"><Input id="instapay_url" value={commSettings.instapay_url} onChange={(e) => setCommSettings({...commSettings, instapay_url: e.target.value})} dir="ltr" /></FormField>
                            <div className="md:col-span-2">
                                <ImageUploadField label="كود QR للتحويل" fieldKey="instapay_qr_url" currentUrl={commSettings.instapay_qr_url} onUrlChange={(_, url) => setCommSettings({...commSettings, instapay_qr_url: url})} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end"><Button onClick={handleCommunicationSubmit} size="lg" icon={<Save />}>حفظ إعدادات التواصل</Button></div>
                </TabsContent>

                <TabsContent value="pricing" className="animate-fadeIn">
                    <Card>
                        <CardHeader>
                            <CardTitle>هيكل التسعير</CardTitle>
                            <CardDescription>تعديل النسبة والرسوم التي تضاف تلقائياً لأسعار المدربين المعروضة للعملاء.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <FormField label="نسبة المنصة (مُعامل الضرب)" htmlFor="company_percentage">
                                    <Input id="company_percentage" type="number" step="0.01" value={pricing.company_percentage} onChange={(e) => setPricing({...pricing, company_percentage: parseFloat(e.target.value)})} />
                                    <p className="text-[10px] text-muted-foreground mt-1">مثال: 1.2 تعني زيادة 20% على سعر المدرب.</p>
                                </FormField>
                                <FormField label="الرسوم الإدارية الثابتة (ج.م)" htmlFor="fixed_fee">
                                    <Input id="fixed_fee" type="number" value={pricing.fixed_fee} onChange={(e) => setPricing({...pricing, fixed_fee: parseFloat(e.target.value)})} />
                                </FormField>
                            </div>
                            <div className="flex justify-end"><Button onClick={handlePricingSubmit} size="lg" icon={<Save />}>حفظ إعدادات التسعير</Button></div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions" className="animate-fadeIn">
                    <PermissionsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettingsPage;
