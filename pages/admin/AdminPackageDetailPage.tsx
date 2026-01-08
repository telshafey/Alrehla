
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import { useAdminCWSettings, useAdminPricingSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
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
import { calculateCustomerPrice } from '../../utils/pricingCalculator';

const AdminPackageDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data, isLoading: settingsLoading } = useAdminCWSettings();
    const { data: pricingConfig, isLoading: pricingLoading } = useAdminPricingSettings();
    const { createPackage, updatePackage } = useCreativeWritingSettingsMutations();
    
    const [pkg, setPkg] = useState<Partial<CreativeWritingPackage>>({
        name: '',
        sessions: '',
        price: 0, // هذا سيمثل "صافي المدرب الافتراضي"
        features: [],
        description: '',
        detailed_description: '',
        target_age: '',
        level: '',
        icon_name: 'Rocket',
        popular: false,
        comparison_values: {}, 
    });

    const [featuresString, setFeaturesString] = useState('');

    useEffect(() => {
        if (!isNew && data?.packages) {
            const foundPkg = data.packages.find(p => p.id === Number(id));
            if (foundPkg) {
                setPkg({ ...foundPkg, comparison_values: foundPkg.comparison_values || {} });
                setFeaturesString(foundPkg.features.join('\n'));
            }
        }
    }, [id, isNew, data]);

    // حساب السعر التقديري للعميل بناءً على الصافي المدخل والمعادلة المركزية
    const estimatedCustomerPrice = useMemo(() => {
        return calculateCustomerPrice(pkg.price, pricingConfig);
    }, [pkg.price, pricingConfig]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...pkg,
            id: isNew ? undefined : Number(id), 
            features: featuresString.split('\n').filter(f => f.trim() !== ''),
        };
        if (isNew) await createPackage.mutateAsync(payload);
        else await updatePackage.mutateAsync(payload);
        navigate('/admin/creative-writing-packages');
    };

    if ((settingsLoading || pricingLoading) && !isNew) return <PageLoader />;

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <Link to="/admin/creative-writing-packages" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold mb-4">
                <ArrowLeft size={16} /> العودة للقائمة
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">
                    {isNew ? 'إضافة باقة جديدة' : `تعديل الباقة: ${pkg.name}`}
                </h1>
                <Button type="submit" form="package-form" loading={createPackage.isPending || updatePackage.isPending} icon={<Save />}>حفظ</Button>
            </div>

            <form id="package-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><CardTitle>بيانات الباقة</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <FormField label="اسم الباقة*" htmlFor="name">
                                <Input id="name" name="name" value={pkg.name} onChange={e => setPkg({...pkg, name: e.target.value})} required />
                            </FormField>
                            <FormField label="عدد الجلسات*" htmlFor="sessions">
                                <Input id="sessions" name="sessions" value={pkg.sessions} onChange={e => setPkg({...pkg, sessions: e.target.value})} required />
                            </FormField>
                            <FormField label="الوصف المختصر" htmlFor="description">
                                <Textarea id="description" name="description" value={pkg.description} onChange={e => setPkg({...pkg, description: e.target.value})} rows={3} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calculator className="text-primary"/> إعدادات التسعير المركزي</CardTitle>
                            <CardDescription>هنا تحدد حصة المدرب الافتراضية، وسيقوم النظام بحساب سعر البيع تلقائياً.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <FormField label="صافي ربح المدرب الافتراضي (ج.م)" htmlFor="price">
                                    <Input 
                                        type="number" 
                                        id="price" 
                                        value={pkg.price} 
                                        onChange={e => setPkg({...pkg, price: parseFloat(e.target.value) || 0})} 
                                        className="font-bold text-lg"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">هذا المبلغ هو ما سيستلمه المدرب إذا لم يحدد سعراً خاصاً به.</p>
                                </FormField>
                                
                                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                    <p className="text-[10px] font-black text-green-700 uppercase mb-1">سعر البيع المتوقع للعميل</p>
                                    <p className="text-2xl font-black text-green-600">
                                        {estimatedCustomerPrice === 0 ? 'مجاني' : `${estimatedCustomerPrice} ج.م`}
                                    </p>
                                    <p className="text-[9px] text-green-800/60 mt-1">بناءً على النسبة ({pricingConfig?.company_percentage}) والرسوم ({pricingConfig?.fixed_fee})</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>الميزات والمقارنة</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="الميزات (كل ميزة في سطر)" htmlFor="features">
                                <Textarea id="features" value={featuresString} onChange={e => setFeaturesString(e.target.value)} rows={6} />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>الحالة والأيقونة</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20 cursor-pointer">
                                <Checkbox checked={pkg.popular} onCheckedChange={v => setPkg({...pkg, popular: !!v})} />
                                <span className="text-sm font-bold">باقة شائعة</span>
                            </label>
                            <FormField label="الأيقونة" htmlFor="icon_name">
                                <Select id="icon_name" value={pkg.icon_name} onChange={e => setPkg({...pkg, icon_name: e.target.value})}>
                                    {Object.keys(IconMap).map(k => <option key={k} value={k}>{k}</option>)}
                                </Select>
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default AdminPackageDetailPage;
