
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Star, Info, List, FileText, CheckSquare } from 'lucide-react';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations/useCreativeWritingSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/Checkbox';
import type { CreativeWritingPackage } from '../../lib/database.types';
import { IconMap } from '../../components/creative-writing/services/IconMap';

const AdminPackageDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data, isLoading: settingsLoading } = useAdminCWSettings();
    const { createPackage, updatePackage } = useCreativeWritingSettingsMutations();
    
    const [pkg, setPkg] = useState<Partial<CreativeWritingPackage>>({
        name: '',
        sessions: '',
        price: 0,
        features: [],
        description: '',
        detailed_description: '',
        target_age: '',
        level: '',
        icon_name: 'Rocket',
        popular: false,
        includes_digital_portfolio: false,
        includes_certificate: false,
        includes_publication: false,
        includes_extra_mentoring: false
    });

    const [featuresString, setFeaturesString] = useState('');

    useEffect(() => {
        if (!isNew && data?.packages) {
            const foundPkg = data.packages.find(p => p.id === Number(id));
            if (foundPkg) {
                setPkg(foundPkg);
                setFeaturesString(foundPkg.features.join('\n'));
            } else if (!settingsLoading) {
                navigate('/admin/creative-writing-packages');
            }
        }
    }, [id, isNew, data, settingsLoading, navigate]);

    const isSaving = createPackage.isPending || updatePackage.isPending;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setPkg(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };
    
    const handleCheckboxChange = (name: string, checked: boolean) => {
        setPkg(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...pkg,
            id: isNew ? undefined : Number(id), 
            features: featuresString.split('\n').filter(f => f.trim() !== ''),
        };

        try {
            if (isNew) {
                await createPackage.mutateAsync(payload);
            } else {
                await updatePackage.mutateAsync(payload);
            }
            navigate('/admin/creative-writing-packages');
        } catch (error) {
            console.error("Error saving package:", error);
        }
    };

    if (settingsLoading && !isNew) return <PageLoader text="جاري تحميل بيانات الباقة..." />;

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <Link to="/admin/creative-writing-packages" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold mb-4">
                <ArrowLeft size={16} /> العودة إلى قائمة الباقات
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">
                    {isNew ? 'إضافة باقة جديدة' : `تعديل الباقة: ${pkg.name}`}
                </h1>
                <Button type="submit" form="package-form" loading={isSaving} icon={<Save />}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </div>

            <form id="package-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Column 1: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Package /> المعلومات الأساسية</CardTitle>
                                <CardDescription>البيانات الرئيسية التي تظهر للعميل في بطاقة الباقة المختصرة.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="اسم الباقة*" htmlFor="name">
                                        <Input id="name" name="name" value={pkg.name} onChange={handleChange} required placeholder="مثال: باقة الانطلاق" />
                                    </FormField>
                                    <FormField label="عدد الجلسات/التفاصيل*" htmlFor="sessions">
                                        <Input id="sessions" name="sessions" value={pkg.sessions} onChange={handleChange} required placeholder="مثال: 4 جلسات (مدة الجلسة 45 دقيقة)" />
                                    </FormField>
                                </div>
                                <FormField label="الوصف المختصر*" htmlFor="description">
                                    <Textarea id="description" name="description" value={pkg.description} onChange={handleChange} rows={3} required placeholder="وصف مختصر وجذاب للباقة..." />
                                </FormField>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText /> المحتوى التفصيلي (للبطاقة الكبيرة)</CardTitle>
                                <CardDescription>يظهر هذا المحتوى في عرض "تفاصيل الباقة".</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="الفئة العمرية المستهدفة" htmlFor="target_age">
                                        <Input id="target_age" name="target_age" value={pkg.target_age || ''} onChange={handleChange} placeholder="مثال: 8-12 سنة" />
                                    </FormField>
                                    <FormField label="المستوى" htmlFor="level">
                                        <Input id="level" name="level" value={pkg.level || ''} onChange={handleChange} placeholder="مثال: مبتدئ، متوسط..." />
                                    </FormField>
                                </div>
                                <FormField label="الوصف التفصيلي (الفوائد والمخرجات)" htmlFor="detailed_description">
                                    <Textarea id="detailed_description" name="detailed_description" value={pkg.detailed_description || ''} onChange={handleChange} rows={6} placeholder="اكتب هنا شرحاً وافياً عن محتوى الباقة وما سيتعلمه الطفل..." />
                                </FormField>
                                 <FormField label="أيقونة الباقة" htmlFor="icon_name">
                                    <Select id="icon_name" name="icon_name" value={pkg.icon_name || 'Rocket'} onChange={handleChange}>
                                        {Object.keys(IconMap).map(iconName => (
                                            <option key={iconName} value={iconName}>{iconName}</option>
                                        ))}
                                    </Select>
                                </FormField>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-blue-200 bg-blue-50/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-800"><CheckSquare /> إعدادات جدول المقارنة</CardTitle>
                                <CardDescription>حدد الميزات التي ستظهر بعلامة (صح) في جدول مقارنة الباقات.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer hover:border-blue-300 transition-colors">
                                        <Checkbox
                                            checked={pkg.includes_digital_portfolio}
                                            onCheckedChange={(checked) => handleCheckboxChange('includes_digital_portfolio', checked)}
                                        />
                                        <span className="font-semibold text-sm">محفظة رقمية للأعمال</span>
                                    </label>
                                    
                                     <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer hover:border-blue-300 transition-colors">
                                        <Checkbox
                                            checked={pkg.includes_certificate}
                                            onCheckedChange={(checked) => handleCheckboxChange('includes_certificate', checked)}
                                        />
                                        <span className="font-semibold text-sm">شهادة إتمام</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer hover:border-blue-300 transition-colors">
                                        <Checkbox
                                            checked={pkg.includes_publication}
                                            onCheckedChange={(checked) => handleCheckboxChange('includes_publication', checked)}
                                        />
                                        <span className="font-semibold text-sm">نشر عمل في المجلة</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer hover:border-blue-300 transition-colors">
                                        <Checkbox
                                            checked={pkg.includes_extra_mentoring}
                                            onCheckedChange={(checked) => handleCheckboxChange('includes_extra_mentoring', checked)}
                                        />
                                        <span className="font-semibold text-sm">جلسات إرشاد إضافية</span>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><List /> قائمة الميزات (نصية)</CardTitle>
                                <CardDescription>تظهر كنقاط في بطاقة الباقة المختصرة.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField label="الميزات (كل ميزة في سطر منفصل)" htmlFor="features">
                                    <Textarea 
                                        id="features" 
                                        value={featuresString} 
                                        onChange={(e) => setFeaturesString(e.target.value)} 
                                        rows={8} 
                                        placeholder="- متابعة أسبوعية&#10;- تمارين إبداعية"
                                        className="font-mono text-sm"
                                    />
                                </FormField>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2: Settings & Pricing */}
                    <div className="lg:col-span-1 space-y-8 sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Star /> الإعدادات والتسعير</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField label="السعر (ج.م)*" htmlFor="price">
                                    <div className="relative">
                                        <Input type="number" id="price" name="price" value={pkg.price} onChange={handleChange} required className="pl-12" />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">ج.م</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">أدخل 0 إذا كانت الباقة مجانية.</p>
                                </FormField>
                                
                                <div className="pt-4 border-t">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted transition-colors">
                                        <Checkbox
                                            checked={pkg.popular}
                                            onCheckedChange={(checked) => setPkg(prev => ({ ...prev, popular: !!checked }))}
                                        />
                                        <div>
                                            <span className="font-semibold text-sm">علامة "الأكثر شيوعاً"</span>
                                            <p className="text-xs text-muted-foreground">تمييز الباقة بشريط خاص.</p>
                                        </div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminPackageDetailPage;
