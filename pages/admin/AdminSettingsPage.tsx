
import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, DollarSign, Shield, Mail } from 'lucide-react';
import { useProduct, SiteBranding } from '../../contexts/ProductContext';
import { useAdminSocialLinks, useAdminPricingSettings, useAdminCommunicationSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import PermissionsManager from '../../components/admin/PermissionsManager';
import ImageUploadField from '../../components/admin/ui/ImageUploadField';


const AdminSettingsPage: React.FC = () => {
    
    // 1. Branding Context (Global Images)
    const { siteBranding: initialBranding, setSiteBranding, loading: brandingLoading } = useProduct();
    const [branding, setBranding] = useState<Partial<SiteBranding>>({});

    // 2. Site Content Query (Project Specific Images)
    const { data: siteContent, isLoading: contentLoading } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();
    const [contentImages, setContentImages] = useState({
        customStory: '',
        subscriptionBox: '',
        cwPhilosophy: ''
    });

    // 3. Communication Settings
    const { data: commsData, isLoading: commsLoading, error: commsError, refetch: refetchComms } = useAdminCommunicationSettings();
    const [commSettings, setCommSettings] = useState({ support_email: '', join_us_email: '', whatsapp_number: '', whatsapp_default_message: '', instapay_url: '', instapay_qr_url: '', instapay_number: '' });
    
    // 4. Social Links
    const { data: socialLinksData, isLoading: socialsLoading, error: socialsError, refetch: refetchSocials } = useAdminSocialLinks();
    const [socials, setSocials] = useState({ facebook_url: '', twitter_url: '', instagram_url: '' });
    
    // 5. Pricing Settings
    const { data: pricingSettingsData, isLoading: pricingLoading, error: pricingError, refetch: refetchPricing } = useAdminPricingSettings();
    const { updateSocialLinks, updateCommunicationSettings, updatePricingSettings } = useSettingsMutations();
    const [pricing, setPricing] = useState({ company_percentage: 1.2, fixed_fee: 50 });


    // --- Effects to Sync Data ---
    useEffect(() => {
        if (initialBranding) setBranding(initialBranding);
    }, [initialBranding]);

    useEffect(() => {
        if (siteContent) {
            setContentImages({
                customStory: siteContent.enhaLakPage?.main?.customStoryImageUrl || '',
                subscriptionBox: siteContent.enhaLakPage?.main?.subscriptionBoxImageUrl || '',
                cwPhilosophy: siteContent.creativeWritingPage?.about?.heroImageUrl || ''
            });
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


    // --- Handlers ---

    const handleBrandingChange = (fieldKey: string, value: string) => {
        setBranding(prev => ({ ...prev, [fieldKey]: value }));
    };

    const handleContentImageChange = (key: keyof typeof contentImages, value: string) => {
        setContentImages(prev => ({ ...prev, [key]: value }));
    };
    
    const handleCommsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCommSettings({ ...commSettings, [e.target.name]: e.target.value });
    };
    
    const handleQrUrlChange = (key: string, url: string) => {
        setCommSettings(prev => ({ ...prev, [key]: url }));
    };

    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };
    
    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPricing({ ...pricing, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleImagesSubmit = async () => {
        try {
            const promises = [];
            
            // Save Branding (Global)
            promises.push(setSiteBranding(branding));

            // Save Content Images (Project Specific)
            if (siteContent) {
                const newContent = JSON.parse(JSON.stringify(siteContent));
                
                // Safely update deeply nested keys
                if (!newContent.enhaLakPage) newContent.enhaLakPage = { main: {} };
                if (!newContent.enhaLakPage.main) newContent.enhaLakPage.main = {};
                
                newContent.enhaLakPage.main.customStoryImageUrl = contentImages.customStory;
                newContent.enhaLakPage.main.subscriptionBoxImageUrl = contentImages.subscriptionBox;

                if (!newContent.creativeWritingPage) newContent.creativeWritingPage = { about: {} };
                if (!newContent.creativeWritingPage.about) newContent.creativeWritingPage.about = {};
                
                newContent.creativeWritingPage.about.heroImageUrl = contentImages.cwPhilosophy;
                
                promises.push(updateSiteContent.mutateAsync(newContent));
            }

            await Promise.all(promises);
        } catch (error) {
            console.error("Error saving images:", error);
        }
    };

    const handleCommunicationSubmit = async () => {
        try {
            await updateCommunicationSettings.mutateAsync(commSettings);
            await updateSocialLinks.mutateAsync(socials);
        } catch (error) {
            console.error("Error saving communication settings", error);
        }
    };
    
    const handlePricingSubmit = async () => {
        try {
            await updatePricingSettings.mutateAsync(pricing);
        } catch (error) {
            console.error("Error saving pricing settings", error);
        }
    };

    const isLoading = brandingLoading || socialsLoading || pricingLoading || commsLoading || contentLoading;
    const error = socialsError || pricingError || commsError;
    const refetch = () => {
        if (socialsError) refetchSocials();
        if (pricingError) refetchPricing();
        if (commsError) refetchComms();
    };

    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">الإعدادات العامة</h1>
            
            <Tabs defaultValue="branding">
                <TabsList>
                    <TabsTrigger value="branding"><ImageIcon className="ml-2" /> العلامة التجارية والصور</TabsTrigger>
                    <TabsTrigger value="communication"><Mail className="ml-2" /> التواصل والروابط</TabsTrigger>
                    <TabsTrigger value="pricing"><DollarSign className="ml-2" /> التسعير</TabsTrigger>
                    <TabsTrigger value="permissions"><Shield className="ml-2" /> الصلاحيات</TabsTrigger>
                </TabsList>

                <TabsContent value="branding">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>صور الموقع العامة</CardTitle>
                                <CardDescription>الصور التي تظهر في الهيدر، الفوتر، والصفحات الرئيسية.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUploadField 
                                        label="شعار الموقع (Logo)" 
                                        fieldKey="logoUrl"
                                        currentUrl={branding.logoUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                    <ImageUploadField 
                                        label="صورة الهيرو (الرئيسية)" 
                                        fieldKey="heroImageUrl"
                                        currentUrl={branding.heroImageUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>صور بطاقات المشاريع</CardTitle>
                                <CardDescription>الصور التي تظهر في البطاقات التعريفية للمشاريع في الصفحة الرئيسية.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUploadField 
                                        label="صورة بطاقة 'إنها لك'" 
                                        fieldKey="enhaLakPortalImageUrl"
                                        currentUrl={branding.enhaLakPortalImageUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                    <ImageUploadField 
                                        label="صورة بطاقة 'بداية الرحلة'" 
                                        fieldKey="creativeWritingPortalImageUrl"
                                        currentUrl={branding.creativeWritingPortalImageUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>صور صفحة "رحلتنا" (من نحن)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUploadField 
                                        label="صورة الهيرو في صفحة 'رحلتنا'" 
                                        fieldKey="aboutHeroImageUrl"
                                        currentUrl={branding.aboutHeroImageUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                    <ImageUploadField 
                                        label="صورة بطاقة 'رحلتنا' (في الرئيسية)" 
                                        fieldKey="aboutPortalImageUrl"
                                        currentUrl={branding.aboutPortalImageUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>صور صفحات المشاريع الداخلية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUploadField 
                                        label="صورة 'القصة المخصصة' (إنها لك)" 
                                        fieldKey="customStory"
                                        currentUrl={contentImages.customStory} 
                                        onUrlChange={(k, v) => handleContentImageChange('customStory', v)}
                                    />
                                    <ImageUploadField 
                                        label="صورة 'صندوق الرحلة' (إنها لك)" 
                                        fieldKey="subscriptionBox"
                                        currentUrl={contentImages.subscriptionBox} 
                                        onUrlChange={(k, v) => handleContentImageChange('subscriptionBox', v)}
                                    />
                                    <ImageUploadField 
                                        label="صورة 'فلسفة البرنامج' (بداية الرحلة)" 
                                        fieldKey="cwPhilosophy"
                                        currentUrl={contentImages.cwPhilosophy} 
                                        onUrlChange={(k, v) => handleContentImageChange('cwPhilosophy', v)}
                                    />
                                     <ImageUploadField 
                                        label="صورة صفحة 'انضم إلينا'" 
                                        fieldKey="joinUsImageUrl"
                                        currentUrl={branding.joinUsImageUrl} 
                                        onUrlChange={handleBrandingChange} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button onClick={handleImagesSubmit} loading={useProduct().loading || updateSiteContent.isPending} icon={<Save />}>حفظ الصور</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="communication">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>معلومات التواصل</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="بريد الدعم الفني" htmlFor="support_email">
                                        <Input id="support_email" name="support_email" value={commSettings.support_email} onChange={handleCommsChange} />
                                    </FormField>
                                    <FormField label="بريد طلبات التوظيف" htmlFor="join_us_email">
                                        <Input id="join_us_email" name="join_us_email" value={commSettings.join_us_email} onChange={handleCommsChange} />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="رقم الواتساب (مع رمز الدولة)" htmlFor="whatsapp_number">
                                        <Input id="whatsapp_number" name="whatsapp_number" value={commSettings.whatsapp_number} onChange={handleCommsChange} placeholder="+201xxxxxxxxx" dir="ltr" />
                                    </FormField>
                                    <FormField label="رسالة الواتساب الافتراضية" htmlFor="whatsapp_default_message">
                                        <Input id="whatsapp_default_message" name="whatsapp_default_message" value={commSettings.whatsapp_default_message} onChange={handleCommsChange} />
                                    </FormField>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-bold mb-4">بيانات الدفع (Instapay)</h4>
                                    <div className="space-y-4">
                                        <FormField label="رابط الدفع" htmlFor="instapay_url">
                                            <Input id="instapay_url" name="instapay_url" value={commSettings.instapay_url} onChange={handleCommsChange} placeholder="https://ipn.eg/..." dir="ltr" />
                                        </FormField>
                                        <FormField label="رقم التحويل" htmlFor="instapay_number">
                                            <Input id="instapay_number" name="instapay_number" value={commSettings.instapay_number} onChange={handleCommsChange} placeholder="01xxxxxxxxx" dir="ltr" />
                                        </FormField>
                                        <ImageUploadField 
                                            label="صورة الباركود (QR Code)"
                                            fieldKey="instapay_qr_url"
                                            currentUrl={commSettings.instapay_qr_url}
                                            onUrlChange={handleQrUrlChange}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>روابط التواصل الاجتماعي</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField label="Facebook" htmlFor="facebook_url">
                                    <Input id="facebook_url" name="facebook_url" value={socials.facebook_url} onChange={handleSocialsChange} dir="ltr" />
                                </FormField>
                                <FormField label="Twitter (X)" htmlFor="twitter_url">
                                    <Input id="twitter_url" name="twitter_url" value={socials.twitter_url} onChange={handleSocialsChange} dir="ltr" />
                                </FormField>
                                <FormField label="Instagram" htmlFor="instagram_url">
                                    <Input id="instagram_url" name="instagram_url" value={socials.instagram_url} onChange={handleSocialsChange} dir="ltr" />
                                </FormField>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button onClick={handleCommunicationSubmit} loading={updateCommunicationSettings.isPending || updateSocialLinks.isPending} icon={<Save />}>حفظ الإعدادات</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pricing">
                    <Card>
                        <CardHeader>
                            <CardTitle>إعدادات التسعير العامة</CardTitle>
                            <CardDescription>التحكم في نسب العمولة والرسوم الثابتة للمنصة.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="نسبة هامش ربح المنصة (مثال: 1.2 يعني 20%)" htmlFor="company_percentage">
                                    <Input id="company_percentage" name="company_percentage" type="number" step="0.01" value={pricing.company_percentage} onChange={handlePricingChange} />
                                </FormField>
                                <FormField label="الرسوم الثابتة لكل عملية (ج.م)" htmlFor="fixed_fee">
                                    <Input id="fixed_fee" name="fixed_fee" type="number" value={pricing.fixed_fee} onChange={handlePricingChange} />
                                </FormField>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                                <p className="font-bold mb-1">معادلة حساب السعر النهائي للعميل:</p>
                                <p className="font-mono" dir="ltr">Final Price = (Instructor Rate * Company Percentage) + Fixed Fee</p>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handlePricingSubmit} loading={updatePricingSettings.isPending} icon={<Save />}>حفظ التسعير</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions">
                    <PermissionsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettingsPage;
