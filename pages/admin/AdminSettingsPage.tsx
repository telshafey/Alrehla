
import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, DollarSign, Shield, Mail, Layout, Database, RefreshCw, AlertTriangle } from 'lucide-react';
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
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../contexts/ToastContext';

const AdminSettingsPage: React.FC = () => {
    const { siteBranding: initialBranding, setSiteBranding, loading: brandingLoading } = useProduct();
    const [branding, setBranding] = useState<Partial<SiteBranding>>({});

    const { data: siteContent, isLoading: contentLoading } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();

    const { data: commsData, isLoading: commsLoading } = useAdminCommunicationSettings();
    const [commSettings, setCommSettings] = useState({ support_email: '', join_us_email: '', whatsapp_number: '', whatsapp_default_message: '', instapay_url: '', instapay_qr_url: '', instapay_number: '' });
    
    const { data: socialLinksData, isLoading: socialsLoading } = useAdminSocialLinks();
    const [socials, setSocials] = useState({ facebook_url: '', twitter_url: '', instagram_url: '' });
    
    const { data: pricingSettingsData, isLoading: pricingLoading } = useAdminPricingSettings();
    const { updateSocialLinks, updateCommunicationSettings, updatePricingSettings } = useSettingsMutations();
    
    const [pricing, setPricing] = useState({ company_percentage: 1.2, fixed_fee: 50 });
    const [isSeeding, setIsSeeding] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (initialBranding) setBranding(initialBranding);
    }, [initialBranding]);

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
        await setSiteBranding(branding);
    };

    const handleCommunicationSubmit = async () => {
        await updateCommunicationSettings.mutateAsync(commSettings);
        await updateSocialLinks.mutateAsync(socials);
    };
    
    const handlePricingSubmit = async () => {
        await updatePricingSettings.mutateAsync(pricing);
    };

    const handleSeedDatabase = async () => {
        if (!window.confirm("تحذير: هذا الإجراء سيقوم بإعادة تعيين كافة نصوص الموقع وإعداداته إلى القيم الافتراضية (البيانات الوهمية). هل أنت متأكد؟")) return;
        
        setIsSeeding(true);
        try {
            await settingsService.initializeDefaults();
            addToast('تمت استعادة البيانات الافتراضية بنجاح.', 'success');
            setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes
        } catch (error: any) {
            addToast(`فشل العملية: ${error.message}`, 'error');
        } finally {
            setIsSeeding(false);
        }
    };

    const isLoading = brandingLoading || socialsLoading || pricingLoading || commsLoading || contentLoading;
    if (isLoading) return <PageLoader />;

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <h1 className="text-3xl font-extrabold text-foreground">الإعدادات العامة</h1>
            
            <Tabs defaultValue="branding">
                <TabsList className="mb-8 flex-wrap h-auto">
                    <TabsTrigger value="branding"><ImageIcon className="ml-2 w-4 h-4" /> هوية الموقع</TabsTrigger>
                    <TabsTrigger value="communication"><Mail className="ml-2 w-4 h-4" /> التواصل</TabsTrigger>
                    <TabsTrigger value="pricing"><DollarSign className="ml-2 w-4 h-4" /> الماليات</TabsTrigger>
                    <TabsTrigger value="permissions"><Shield className="ml-2 w-4 h-4" /> الصلاحيات</TabsTrigger>
                    <TabsTrigger value="data"><Database className="ml-2 w-4 h-4" /> البيانات</TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>الشعار والصورة الرئيسية</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUploadField label="شعار المنصة (Logo)" fieldKey="logoUrl" currentUrl={branding.logoUrl} onUrlChange={handleBrandingChange} />
                            <ImageUploadField label="صورة الهيرو (الصفحة الرئيسية)" fieldKey="heroImageUrl" currentUrl={branding.heroImageUrl} onUrlChange={handleBrandingChange} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>صور بطاقات الأقسام (الصفحة الرئيسية)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ImageUploadField label="بطاقة إنها لك" fieldKey="enhaLakPortalImageUrl" currentUrl={branding.enhaLakPortalImageUrl} onUrlChange={handleBrandingChange} />
                            <ImageUploadField label="بطاقة بداية الرحلة" fieldKey="creativeWritingPortalImageUrl" currentUrl={branding.creativeWritingPortalImageUrl} onUrlChange={handleBrandingChange} />
                            <ImageUploadField label="بطاقة من نحن" fieldKey="aboutPortalImageUrl" currentUrl={branding.aboutPortalImageUrl} onUrlChange={handleBrandingChange} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>صور الصفحات الداخلية</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUploadField label="هيرو صفحة من نحن" fieldKey="aboutHeroImageUrl" currentUrl={branding.aboutHeroImageUrl} onUrlChange={handleBrandingChange} />
                            <ImageUploadField label="صورة صفحة انضم إلينا" fieldKey="joinUsImageUrl" currentUrl={branding.joinUsImageUrl} onUrlChange={handleBrandingChange} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end sticky bottom-6 z-10">
                        <Button onClick={handleImagesSubmit} icon={<Save />} className="shadow-lg" size="lg">حفظ الهوية البصرية</Button>
                    </div>
                </TabsContent>

                <TabsContent value="communication" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>روابط التواصل الاجتماعي</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="فيسبوك" htmlFor="fb"><Input id="fb" value={socials.facebook_url} onChange={(e) => setSocials({...socials, facebook_url: e.target.value})} /></FormField>
                            <FormField label="تويتر" htmlFor="tw"><Input id="tw" value={socials.twitter_url} onChange={(e) => setSocials({...socials, twitter_url: e.target.value})} /></FormField>
                            <FormField label="انستجرام" htmlFor="ig"><Input id="ig" value={socials.instagram_url} onChange={(e) => setSocials({...socials, instagram_url: e.target.value})} /></FormField>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end"><Button onClick={handleCommunicationSubmit} icon={<Save />}>حفظ التواصل</Button></div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>هيكل التسعير (المعادلة الحسابية)</CardTitle>
                            <CardDescription>هذه الإعدادات تحدد كيف يتم حساب السعر النهائي للعميل بناءً على سعر المدرب المختار.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="نسبة المنصة (مُعامل الضرب)" htmlFor="company_percentage">
                                    <Input id="company_percentage" type="number" step="0.1" value={pricing.company_percentage} onChange={(e) => setPricing({...pricing, company_percentage: parseFloat(e.target.value)})} />
                                    <p className="text-xs text-muted-foreground mt-1">مثال: 1.2 تعني زيادة 20% على سعر المدرب.</p>
                                </FormField>
                                <FormField label="الرسوم الإدارية الثابتة (ج.م)" htmlFor="fixed_fee">
                                    <Input id="fixed_fee" type="number" value={pricing.fixed_fee} onChange={(e) => setPricing({...pricing, fixed_fee: parseFloat(e.target.value)})} />
                                    <p className="text-xs text-muted-foreground mt-1">تضاف بعد احتساب النسبة.</p>
                                </FormField>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                                <p className="text-sm font-bold text-blue-800 mb-2">معاينة المعادلة الحالية:</p>
                                <div className="text-lg font-mono text-center bg-white p-3 rounded border">
                                    السعر النهائي = (سعر المدرب * {pricing.company_percentage}) + {pricing.fixed_fee} ج.م
                                </div>
                            </div>
                            
                            <div className="flex justify-end"><Button onClick={handlePricingSubmit} icon={<Save />}>حفظ إعدادات التسعير</Button></div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions">
                    <PermissionsManager />
                </TabsContent>

                <TabsContent value="data" className="space-y-6">
                     <Card className="border-t-4 border-yellow-400">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-700">
                                <Database /> التهيئة الأولية للمحتوى
                            </CardTitle>
                            <CardDescription>
                                استخدم هذه الأداة لملء قاعدة البيانات بالبيانات الافتراضية (النصوص، الأسعار، الإعدادات) في حال كانت القاعدة فارغة أو أردت إعادة التعيين.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3 text-sm text-yellow-800 mb-6">
                                <AlertTriangle className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">تنبيه هام:</p>
                                    <p>هذا الإجراء سيقوم بحفظ البيانات الافتراضية في قاعدة البيانات (Supabase). إذا قمت بتعديل محتوى الموقع سابقاً، قد يتم استبداله بالقيم الافتراضية.</p>
                                </div>
                            </div>
                            <Button onClick={handleSeedDatabase} loading={isSeeding} variant="outline" className="w-full sm:w-auto" icon={<RefreshCw />}>
                                استعادة/تثبيت المحتوى الافتراضي
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettingsPage;
