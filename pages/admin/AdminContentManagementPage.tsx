import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader2, Home, Info, ShoppingBag, BookOpen } from 'lucide-react';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import AdminSection from '../../components/admin/AdminSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import Accordion from '../../components/ui/Accordion';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { SiteContent } from '../../lib/database.types';

const AdminContentManagementPage: React.FC = () => {
    const { data, isLoading, error } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();
    const [content, setContent] = useState<SiteContent | null>(null);
    const [activeTab, setActiveTab] = useState('portal');

    useEffect(() => {
        if (data) {
            setContent(JSON.parse(JSON.stringify(data)));
        }
    }, [data]);

    const handleSimpleChange = (section: keyof SiteContent, field: string, value: string) => {
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };
    
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

    if (isLoading || !content) return <Loader2 className="animate-spin mx-auto" />;
    if (error) return <div className="text-red-500">{error.message}</div>;

    const tabs = [
        { key: 'portal', label: 'الصفحة الرئيسية', icon: <Home size={18} /> },
        { key: 'about', label: 'صفحة "عنا"', icon: <Info size={18} /> },
        { key: 'enhaLak', label: 'قسم "إنها لك"', icon: <ShoppingBag size={18} /> },
        { key: 'creativeWriting', label: 'قسم "بداية الرحلة"', icon: <BookOpen size={18} /> },
    ];
    
    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة محتوى الموقع</h1>
            <form onSubmit={handleSubmit}>
                <AdminSection title="محتوى الصفحات" icon={<FileText />}>
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
                                <FormField label="العنوان الرئيسي" htmlFor="p_heroTitle">
                                    <Textarea id="p_heroTitle" value={content.portalPage.heroTitle} onChange={(e) => handleSimpleChange('portalPage', 'heroTitle', e.target.value)} rows={2}/>
                                </FormField>
                                <FormField label="النص الفرعي" htmlFor="p_heroSubtitle">
                                    <Textarea id="p_heroSubtitle" value={content.portalPage.heroSubtitle} onChange={(e) => handleSimpleChange('portalPage', 'heroSubtitle', e.target.value)} rows={3}/>
                                </FormField>
                                <FormField label="وصف قسم 'إنها لك'" htmlFor="p_enhaLakDesc">
                                    <Textarea id="p_enhaLakDesc" value={content.portalPage.enhaLakDescription} onChange={(e) => handleSimpleChange('portalPage', 'enhaLakDescription', e.target.value)} rows={2} />
                                </FormField>
                                <FormField label="وصف قسم 'بداية الرحلة'" htmlFor="p_cwDesc">
                                    <Textarea id="p_cwDesc" value={content.portalPage.creativeWritingDescription} onChange={(e) => handleSimpleChange('portalPage', 'creativeWritingDescription', e.target.value)} rows={2} />
                                </FormField>
                            </div>
                        </TabsContent>

                        <TabsContent value="about">
                            <div className="space-y-4 pt-4">
                                <FormField label="رسالتنا" htmlFor="a_mission">
                                    <Textarea id="a_mission" value={content.aboutPage.missionStatement} onChange={(e) => handleSimpleChange('aboutPage', 'missionStatement', e.target.value)} rows={3}/>
                                </FormField>
                                <FormField label="قصتنا" htmlFor="a_story">
                                    <Textarea id="a_story" value={content.aboutPage.ourStory} onChange={(e) => handleSimpleChange('aboutPage', 'ourStory', e.target.value)} rows={4}/>
                                </FormField>
                                <FormField label="رؤيتنا" htmlFor="a_vision">
                                    <Textarea id="a_vision" value={content.aboutPage.ourVision} onChange={(e) => handleSimpleChange('aboutPage', 'ourVision', e.target.value)} rows={3}/>
                                </FormField>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="enhaLak">
                            <div className="space-y-6 pt-4">
                                <Accordion title="الصفحة التعريفية للقسم">
                                    <div className="p-4 space-y-4">
                                        <FormField label="العنوان الرئيسي" htmlFor="el_main_heroTitle">
                                            <Input id="el_main_heroTitle" value={content.enhaLakPage.main.heroTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'heroTitle', e.target.value)} />
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="el_main_heroSubtitle">
                                            <Textarea id="el_main_heroSubtitle" value={content.enhaLakPage.main.heroSubtitle} onChange={(e) => handleNestedChange('enhaLakPage', 'main', 'heroSubtitle', e.target.value)} rows={3}/>
                                        </FormField>
                                    </div>
                                </Accordion>
                                <Accordion title="صفحة متجر القصص">
                                    <div className="p-4 space-y-4">
                                         <FormField label="العنوان الرئيسي" htmlFor="el_store_heroTitle">
                                            <Input id="el_store_heroTitle" value={content.enhaLakPage.store.heroTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'store', 'heroTitle', e.target.value)} />
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="el_store_heroSubtitle">
                                            <Textarea id="el_store_heroSubtitle" value={content.enhaLakPage.store.heroSubtitle} onChange={(e) => handleNestedChange('enhaLakPage', 'store', 'heroSubtitle', e.target.value)} rows={2}/>
                                        </FormField>
                                    </div>
                                </Accordion>
                                <Accordion title="صفحة صندوق الرحلة">
                                     <div className="p-4 space-y-4">
                                         <FormField label="العنوان الرئيسي" htmlFor="el_sub_heroTitle">
                                            <Input id="el_sub_heroTitle" value={content.enhaLakPage.subscription.heroTitle} onChange={(e) => handleNestedChange('enhaLakPage', 'subscription', 'heroTitle', e.target.value)} />
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="el_sub_heroSubtitle">
                                            <Textarea id="el_sub_heroSubtitle" value={content.enhaLakPage.subscription.heroSubtitle} onChange={(e) => handleNestedChange('enhaLakPage', 'subscription', 'heroSubtitle', e.target.value)} rows={3}/>
                                        </FormField>
                                        <FormField label="ميزات الصندوق (كل ميزة في سطر)" htmlFor="el_sub_features">
                                            <Textarea 
                                                id="el_sub_features" 
                                                value={(content.enhaLakPage.subscription.features || []).join('\n')} 
                                                onChange={(e) => handleNestedChange('enhaLakPage', 'subscription', 'features', e.target.value.split('\n'))} 
                                                rows={4}
                                            />
                                        </FormField>
                                    </div>
                                </Accordion>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="creativeWriting">
                            <div className="space-y-6 pt-4">
                                <Accordion title="الصفحة الرئيسية للقسم">
                                     <div className="p-4 space-y-4">
                                        <FormField label="العنوان الرئيسي" htmlFor="cw_main_heroTitle">
                                            <Textarea id="cw_main_heroTitle" value={content.creativeWritingPage.main.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'main', 'heroTitle', e.target.value)} rows={2}/>
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="cw_main_heroSubtitle">
                                            <Textarea id="cw_main_heroSubtitle" value={content.creativeWritingPage.main.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'main', 'heroSubtitle', e.target.value)} rows={3}/>
                                        </FormField>
                                         <FormField label="عنوان قسم المنهجية" htmlFor="cw_main_methodologyTitle">
                                            <Input id="cw_main_methodologyTitle" value={content.creativeWritingPage.main.methodologyTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'main', 'methodologyTitle', e.target.value)} />
                                        </FormField>
                                    </div>
                                </Accordion>
                                <Accordion title='صفحة "عن البرنامج"'>
                                    <div className="p-4 space-y-4">
                                        <FormField label="العنوان الرئيسي" htmlFor="cw_about_heroTitle">
                                            <Input id="cw_about_heroTitle" value={content.creativeWritingPage.about.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'about', 'heroTitle', e.target.value)} />
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="cw_about_heroSubtitle">
                                            <Textarea id="cw_about_heroSubtitle" value={content.creativeWritingPage.about.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'about', 'heroSubtitle', e.target.value)} rows={3}/>
                                        </FormField>
                                    </div>
                                </Accordion>
                                <Accordion title='صفحة "خريطة الرحلة"'>
                                     <div className="p-4 space-y-4">
                                        <FormField label="العنوان الرئيسي" htmlFor="cw_curr_heroTitle">
                                            <Input id="cw_curr_heroTitle" value={content.creativeWritingPage.curriculum.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'curriculum', 'heroTitle', e.target.value)} />
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="cw_curr_heroSubtitle">
                                            <Textarea id="cw_curr_heroSubtitle" value={content.creativeWritingPage.curriculum.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'curriculum', 'heroSubtitle', e.target.value)} rows={2}/>
                                        </FormField>
                                    </div>
                                </Accordion>
                                <Accordion title='صفحة "المدربون"'>
                                      <div className="p-4 space-y-4">
                                        <FormField label="العنوان الرئيسي" htmlFor="cw_inst_heroTitle">
                                            <Input id="cw_inst_heroTitle" value={content.creativeWritingPage.instructors.heroTitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'instructors', 'heroTitle', e.target.value)} />
                                        </FormField>
                                        <FormField label="النص التعريفي" htmlFor="cw_inst_heroSubtitle">
                                            <Textarea id="cw_inst_heroSubtitle" value={content.creativeWritingPage.instructors.heroSubtitle} onChange={(e) => handleNestedChange('creativeWritingPage', 'instructors', 'heroSubtitle', e.target.value)} rows={3}/>
                                        </FormField>
                                    </div>
                                </Accordion>
                            </div>
                        </TabsContent>
                    </Tabs>
                </AdminSection>
                
                 <div className="flex justify-end sticky bottom-6 mt-8">
                    <button type="submit" disabled={updateSiteContent.isPending} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {updateSiteContent.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{updateSiteContent.isPending ? 'جاري الحفظ...' : 'حفظ المحتوى'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminContentManagementPage;