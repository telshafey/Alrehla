import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, Image as ImageIcon, DollarSign, Shield, Mail } from 'lucide-react';
import { useProduct, SiteBranding } from '../../contexts/ProductContext';
import { useAdminSocialLinks, useAdminPricingSettings, useAdminCommunicationSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import PermissionsManager from '../../components/admin/PermissionsManager';
import { useAuth } from '../../contexts/AuthContext';


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
    const { permissions } = useAuth();
    // Branding
    const { siteBranding: initialBranding, setSiteBranding, loading: brandingLoading } = useProduct();
    const [branding, setBranding] = useState<Partial<SiteBranding>>({});

    // Communication Settings (new)
    const { data: commsData, isLoading: commsLoading, error: commsError, refetch: refetchComms } = useAdminCommunicationSettings();
    const [commSettings, setCommSettings] = useState({ support_email: '', join_us_email: '', whatsapp_number: '', whatsapp_default_message: '' });
    
    // Social Links
    const { data: socialLinksData, isLoading: socialsLoading, error: socialsError, refetch: refetchSocials } = useAdminSocialLinks();
    const [socials, setSocials] = useState({ facebook_url: '', twitter_url: '', instagram_url: '' });
    
    // Pricing Settings
    const { data: pricingSettingsData, isLoading: pricingLoading, error: pricingError, refetch: refetchPricing } = useAdminPricingSettings();
    const { updateSocialLinks, updateCommunicationSettings, updatePricingSettings } = useSettingsMutations();
    const [pricing, setPricing] = useState({ company_percentage: 1.2, fixed_fee: 50 });


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

    const handleBrandingChange = (fieldKey: keyof SiteBranding, value: string) => {
        setBranding(prev => ({ ...prev, [fieldKey]: value }));
    };
    
    const handleCommsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCommSettings({ ...commSettings, [e.target.name]: e.target.value });
    };

    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };
    
    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPricing({ ...pricing, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleBrandingSubmit = async () => {
        await setSiteBranding(branding);
    };

    const handleCommunicationSubmit = async () => {
        await updateCommunicationSettings.mutateAsync(commSettings);
        await updateSocialLinks.mutateAsync(socials);
    };
    
    const handlePricingSubmit = async () => {
        await updatePricingSettings.mutateAsync(pricing);
    };

    const isLoading = brandingLoading || socialsLoading || pricingLoading || commsLoading;
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
            <h1 className="text-3xl font-extrabold text-foreground">الإعدادات العامة للمنصة</h1>
            
            <Tabs defaultValue="branding">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                    <TabsTrigger value="branding"><ImageIcon className="ml-2" /> العلامة التجارية</TabsTrigger>
                    <TabsTrigger value="communication"><Mail className="ml-2" /> التواصل</TabsTrigger>
                    <TabsTrigger value="pricing"><DollarSign className="ml-2" /> التسعير</TabsTrigger>
                    {permissions.canManageUsers && <TabsTrigger value="permissions"><Shield className="ml-2" /> صلاحيات الأدوار</TabsTrigger>}
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

                 <TabsContent value="communication">
                     <Card>
                        <CardHeader>
                            <CardTitle>إدارة قنوات التواصل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <section>
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">توجيه رسائل البريد الإلكتروني</h3>
                                <div className="space-y-4">
                                    <FormField label="بريد استلام رسائل الدعم" htmlFor="support_email">
                                        <Input id="support_email" name="support_email" type="email" value={commSettings.support_email || ''} onChange={handleCommsChange} dir="ltr"/>
                                    </FormField>
                                    <FormField label="بريد استلام طلبات الانضمام" htmlFor="join_us_email">
                                        <Input id="join_us_email" name="join_us_email" type="email" value={commSettings.join_us_email || ''} onChange={handleCommsChange} dir="ltr"/>
                                    </FormField>
                                </div>
                            </section>
                            <section>
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">إعدادات واتساب</h3>
                                <div className="space-y-4">
                                    <FormField label="رقم الهاتف (مع رمز الدولة)" htmlFor="whatsapp_number">
                                        <Input id="whatsapp_number" name="whatsapp_number" value={commSettings.whatsapp_number || ''} onChange={handleCommsChange} dir="ltr" placeholder="+201234567890"/>
                                    </FormField>
                                    <FormField label="الرسالة الافتراضية" htmlFor="whatsapp_default_message">
                                        <Textarea id="whatsapp_default_message" name="whatsapp_default_message" value={commSettings.whatsapp_default_message || ''} onChange={handleCommsChange} rows={3}/>
                                    </FormField>
                                </div>
                            </section>
                            <section>
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">روابط التواصل الاجتماعي</h3>
                                <div className="space-y-4">
                                    <FormField label="رابط فيسبوك" htmlFor="facebook_url">
                                        <Input id="facebook_url" name="facebook_url" value={socials.facebook_url || ''} onChange={handleSocialsChange} dir="ltr"/>
                                    </FormField>
                                    <FormField label="رابط تويتر (X)" htmlFor="twitter_url">
                                        <Input id="twitter_url" name="twitter_url" value={socials.twitter_url || ''} onChange={handleSocialsChange} dir="ltr"/>
                                    </FormField>
                                    <FormField label="رابط انستغرام" htmlFor="instagram_url">
                                        <Input id="instagram_url" name="instagram_url" value={socials.instagram_url || ''} onChange={handleSocialsChange} dir="ltr"/>
                                    </FormField>
                                </div>
                            </section>
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleCommunicationSubmit} loading={updateCommunicationSettings.isPending || updateSocialLinks.isPending} icon={<Save />}>حفظ إعدادات التواصل</Button>
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

                <TabsContent value="permissions">
                    <PermissionsManager />
                </TabsContent>
            </Tabs>

        </div>
    );
};

export default AdminSettingsPage;