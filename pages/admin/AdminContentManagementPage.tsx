import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Home, Info, ShoppingBag, BookOpen, Edit, Gift } from 'lucide-react';
import { useAdminSiteContent, useAdminBlogPosts } from '../../hooks/queries/admin/useAdminContentQuery';
import { useAdminPersonalizedProducts } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import AdminSection from '../../components/admin/AdminSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import Accordion from '../../components/ui/Accordion';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import type { SiteContent } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import PageLoader from '../../components/ui/PageLoader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

const AdminContentManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading: contentLoading, error: contentError } = useAdminSiteContent();
    const { data: blogPosts = [], isLoading: blogsLoading } = useAdminBlogPosts();
    const { data: products = [], isLoading: productsLoading } = useAdminPersonalizedProducts();
    const { updateSiteContent } = useContentMutations();
    
    const [content, setContent] = useState<SiteContent | null>(null);
    const [activeTab, setActiveTab] = useState('portal');

    useEffect(() => {
        if (data) {
            setContent(JSON.parse(JSON.stringify(data)));
        }
    }, [data]);
    
    const handleNestedChange = (section: keyof SiteContent, page: string, field: string, value: string | string[]) => {
         setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [page]: {
                    ...prev[section][page],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(content) {
            await updateSiteContent.mutateAsync(content);
        }
    };

    const isLoading = contentLoading || blogsLoading || productsLoading;
    const error = contentError; // Simplified error handling

    if (isLoading || !content) return <PageLoader text="جاري تحميل محتوى الموقع..." />;
    if (error) return <div className="text-red-500">{(error as Error).message}</div>;

    const tabs = [
        { key: 'portal', label: 'الرئيسية', icon: <Home size={18} /> },
        { key: 'about', label: '"عنا"', icon: <Info size={18} /> },
        { key: 'enhaLak', label: '"إنها لك"', icon: <ShoppingBag size={18} /> },
        { key: 'creativeWriting', label: '"بداية الرحلة"', icon: <BookOpen size={18} /> },
    ];
    
    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">مركز إدارة المحتوى</h1>
            <form onSubmit={handleSubmit}>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <AdminSection title="محتوى الصفحات الثابتة" icon={<FileText />}>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList>
                                    {tabs.map(tab => (
                                        <TabsTrigger key={tab.key} value={tab.key}>
                                            {tab.icon}
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                
                                <TabsContent value="portal">
                                    <div className="space-y-4 pt-4">
                                        <Accordion title="قسم الهيرو">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="p_heroTitle"><Textarea id="p_heroTitle" value={content.portalPage.heroTitle} onChange={(e) => handleNestedChange('portalPage', 'main', 'heroTitle', e.target.value)} rows={2}/></FormField>
                                                <FormField label="النص الفرعي" htmlFor="p_heroSubtitle"><Textarea id="p_heroSubtitle" value={content.portalPage.heroSubtitle} onChange={(e) => handleNestedChange('portalPage', 'main', 'heroSubtitle', e.target.value)} rows={3}/></FormField>
                                            </div>
                                        </Accordion>
                                        <Accordion title="قسم المشاريع">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="وصف قسم 'إنها لك'" htmlFor="p_enhaLakDesc"><Textarea id="p_enhaLakDesc" value={content.portalPage.enhaLakDescription} onChange={(e) => handleNestedChange('portalPage', 'main', 'enhaLakDescription', e.target.value)} rows={2} /></FormField>
                                                <FormField label="وصف قسم 'بداية الرحلة'" htmlFor="p_cwDesc"><Textarea id="p_cwDesc" value={content.portalPage.creativeWritingDescription} onChange={(e) => handleNestedChange('portalPage', 'main', 'creativeWritingDescription', e.target.value)} rows={2} /></FormField>
                                            </div>
                                        </Accordion>
                                         <Accordion title="قسم 'لماذا نحن؟'">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان" htmlFor="p_vpTitle"><Input id="p_vpTitle" value={content.portalPage.valuePropositionTitle} onChange={(e) => handleNestedChange('portalPage', 'main', 'valuePropositionTitle', e.target.value)}/></FormField>
                                            </div>
                                        </Accordion>
                                        <Accordion title="قسم 'قصتنا'">
                                            <div className="p-4 space-y-4 border-t">
                                                 <FormField label="العنوان" htmlFor="p_aboutTitle"><Input id="p_aboutTitle" value={content.portalPage.aboutSectionTitle} onChange={(e) => handleNestedChange('portalPage', 'main', 'aboutSectionTitle', e.target.value)}/></FormField>
                                                 <FormField label="المحتوى" htmlFor="p_aboutContent"><Textarea id="p_aboutContent" value={content.portalPage.aboutSectionContent} onChange={(e) => handleNestedChange('portalPage', 'main', 'aboutSectionContent', e.target.value)} rows={3}/></FormField>
                                            </div>
                                        </Accordion>
                                    </div>
                                </TabsContent>

                                <TabsContent value="about">
                                    <div className="space-y-4 pt-4">
                                        <FormField label="العنوان الرئيسي" htmlFor="a_heroTitle"><Input id="a_heroTitle" value={content.aboutPage.heroTitle} onChange={(e) => handleNestedChange('aboutPage', 'main', 'heroTitle', e.target.value)}/></FormField>
                                        <FormField label="رسالتنا" htmlFor="a_mission"><Textarea id="a_mission" value={content.aboutPage.missionStatement} onChange={(e) => handleNestedChange('aboutPage', 'main', 'missionStatement', e.target.value)} rows={3}/></FormField>
                                        <FormField label="قصتنا" htmlFor="a_story"><Textarea id="a_story" value={content.aboutPage.ourStory} onChange={(e) => handleNestedChange('aboutPage', 'main', 'ourStory', e.target.value)} rows={4}/></FormField>
                                        <FormField label="رؤيتنا" htmlFor="a_vision"><Textarea id="a_vision" value={content.aboutPage.ourVision} onChange={(e) => handleNestedChange('aboutPage', 'main', 'ourVision', e.target.value)} rows={3}/></FormField>
                                        <FormField label="عنوان القيم" htmlFor="a_valuesTitle"><Input id="a_valuesTitle" value={content.aboutPage.valuesTitle} onChange={(e) => handleNestedChange('aboutPage', 'main', 'valuesTitle', e.target.value)}/></FormField>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="enhaLak">
                                    <div className="space-y-4 pt-4">
                                        <Accordion title="الصفحة التعريفية للقسم">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="el_main_heroTitle"><Input id="el_main_heroTitle" value={content.enhaLakPage.main.heroTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="النص التعريفي" htmlFor="el_main_heroSubtitle"><Textarea id="el_main_heroSubtitle" value={content.enhaLakPage.main.heroSubtitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'heroSubtitle', e.target.value)} rows={3}/></FormField>
                                                <FormField label="عنوان 'ماذا نصنع؟'" htmlFor="el_main_productsTitle"><Input id="el_main_productsTitle" value={content.enhaLakPage.main.productsTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'productsTitle', e.target.value)} /></FormField>
                                                <FormField label="عنوان 'كيف نعمل؟'" htmlFor="el_main_howItWorks"><Input id="el_main_howItWorks" value={content.enhaLakPage.main.howItWorksTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'howItWorksTitle', e.target.value)} /></FormField>
                                                <FormField label="عنوان 'آراء العائلات'" htmlFor="el_main_testimonials"><Input id="el_main_testimonials" value={content.enhaLakPage.main.testimonialsTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'testimonialsTitle', e.target.value)} /></FormField>
                                                <FormField label="عنوان 'الدعوة النهائية'" htmlFor="el_main_cta"><Input id="el_main_cta" value={content.enhaLakPage.main.finalCtaTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'finalCtaTitle', e.target.value)} /></FormField>
                                            </div>
                                        </Accordion>
                                        <Accordion title="صفحة متجر القصص">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="el_store_heroTitle"><Input id="el_store_heroTitle" value={content.enhaLakPage.store.heroTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'store', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="النص التعريفي" htmlFor="el_store_heroSubtitle"><Textarea id="el_store_heroSubtitle" value={content.enhaLakPage.store.heroSubtitle} onChange={(e) => handleNestedChange('enhaLakPage', 'store', 'heroSubtitle', e.target.value)} rows={2}/></FormField>
                                                <FormField label="عنوان بانر الاشتراك" htmlFor="el_store_subBanner"><Input id="el_store_subBanner" value={content.enhaLakPage.store.subscriptionBannerTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'store', 'subscriptionBannerTitle', e.target.value)} /></FormField>
                                            </div>
                                        </Accordion>
                                        <Accordion title="صفحة الاشتراك">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="el_sub_heroTitle"><Input id="el_sub_heroTitle" value={content.enhaLakPage.subscription.heroTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'subscription', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="النص التعريفي" htmlFor="el_sub_heroSubtitle"><Textarea id="el_sub_heroSubtitle" value={content.enhaLakPage.subscription.heroSubtitle} onChange={(e) => handleNestedChange('enhaLakPage', 'subscription', 'heroSubtitle', e.target.value)} rows={2}/></FormField>
                                            </div>
                                        </Accordion>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="creativeWriting">
                                    <div className="space-y-4 pt-4">
                                         <Accordion title="الصفحة الرئيسية للبرنامج">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="cw_main_heroTitle"><Input id="cw_main_heroTitle" value={content.creativeWritingPage.main.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'main', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="النص التعريفي" htmlFor="cw_main_heroSubtitle"><Textarea id="cw_main_heroSubtitle" value={content.creativeWritingPage.main.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'main', 'heroSubtitle', e.target.value)} rows={3}/></FormField>
                                                <FormField label="عنوان المنهجية" htmlFor="cw_main_methodologyTitle"><Input id="cw_main_methodologyTitle" value={content.creativeWritingPage.main.methodologyTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'main', 'methodologyTitle', e.target.value)} /></FormField>
                                            </div>
                                        </Accordion>
                                         <Accordion title="صفحة 'فلسفة البرنامج'">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="cw_about_heroTitle"><Input id="cw_about_heroTitle" value={content.creativeWritingPage.about.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'about', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="النص التعريفي" htmlFor="cw_about_heroSubtitle"><Textarea id="cw_about_heroSubtitle" value={content.creativeWritingPage.about.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'about', 'heroSubtitle', e.target.value)} rows={2}/></FormField>
                                                <FormField label="عنوان الفلسفة" htmlFor="cw_about_philosophyTitle"><Input id="cw_about_philosophyTitle" value={content.creativeWritingPage.about.philosophyTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'about', 'philosophyTitle', e.target.value)} /></FormField>
                                            </div>
                                        </Accordion>
                                        <Accordion title="صفحة 'خريطة الرحلة'">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="cw_curriculum_heroTitle"><Input id="cw_curriculum_heroTitle" value={content.creativeWritingPage.curriculum.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'curriculum', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="عنوان كنوز الرحلة" htmlFor="cw_curriculum_treasuresTitle"><Input id="cw_curriculum_treasuresTitle" value={content.creativeWritingPage.curriculum.treasuresTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'curriculum', 'treasuresTitle', e.target.value)} /></FormField>
                                            </div>
                                        </Accordion>
                                         <Accordion title="صفحة 'المدربون'">
                                            <div className="p-4 space-y-4 border-t">
                                                <FormField label="العنوان الرئيسي" htmlFor="cw_instructors_heroTitle"><Input id="cw_instructors_heroTitle" value={content.creativeWritingPage.instructors.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'instructors', 'heroTitle', e.target.value)} /></FormField>
                                                <FormField label="النص التعريفي" htmlFor="cw_instructors_heroSubtitle"><Textarea id="cw_instructors_heroSubtitle" value={content.creativeWritingPage.instructors.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'instructors', 'heroSubtitle', e.target.value)} rows={2}/></FormField>
                                            </div>
                                        </Accordion>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </AdminSection>
                    </div>
                    <div className="lg:col-span-1 space-y-8 sticky top-24">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Edit /> إدارة المدونة</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">لديك <span className="font-bold">{blogPosts.length}</span> مقالات، منها <span className="font-bold">{blogPosts.filter(p=>p.status === 'draft').length}</span> مسودات.</p>
                                <Button onClick={() => navigate('/admin/blog')} className="w-full mt-4">الانتقال لإدارة المدونة</Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Gift /> إدارة المنتجات</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">لديك <span className="font-bold">{products.length}</span> منتجات مخصصة.</p>
                                 <Button onClick={() => navigate('/admin/personalized-products')} className="w-full mt-4">الانتقال لإدارة المنتجات</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                 <div className="flex justify-end sticky bottom-6 mt-8">
                    <Button type="submit" loading={updateSiteContent.isPending} size="lg" icon={<Save />}>
                        {updateSiteContent.isPending ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminContentManagementPage;
