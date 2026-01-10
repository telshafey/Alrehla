
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Tag, Calculator } from 'lucide-react';
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
import { IconMap } from '../../components/creative-writing/services/IconMap';
import type { StandaloneService } from '../../lib/database.types';
import { calculateCustomerPrice } from '../../utils/pricingCalculator';

const AdminServiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: settings, isLoading: settingsLoading } = useAdminCWSettings();
    const { data: pricingConfig, isLoading: pricingLoading } = useAdminPricingSettings();
    const { createStandaloneService, updateStandaloneService } = useCreativeWritingSettingsMutations();
    
    const [service, setService] = useState<Partial<StandaloneService>>({
        name: '',
        price: 0, // الصافي الافتراضي
        description: '',
        category: 'استشارات',
        icon_name: 'MessageSquare',
        requires_file_upload: false,
        provider_type: 'instructor',
    });

    useEffect(() => {
        if (!isNew && settings?.standaloneServices) {
            const found = settings.standaloneServices.find(s => s.id === Number(id));
            if (found) setService(found);
        }
    }, [id, isNew, settings]);

    const estimatedCustomerPrice = useMemo(() => {
        // استخدام الدالة الموحدة لضمان تطابق السعر مع ما يراه العميل
        return calculateCustomerPrice(service.price, pricingConfig);
    }, [service.price, pricingConfig]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) await createStandaloneService.mutateAsync(service);
        else await updateStandaloneService.mutateAsync(service);
        navigate('/admin/creative-writing-services');
    };

    if (settingsLoading || pricingLoading) return <PageLoader />;

    return (
        <div className="animate-fadeIn space-y-8">
            <Link to="/admin/creative-writing-services" className="inline-flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                <ArrowLeft size={16} /> العودة للخدمات
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">
                    {isNew ? 'إضافة خدمة جديدة' : `تعديل خدمة: ${service.name}`}
                </h1>
                <Button type="submit" form="service-form" loading={createStandaloneService.isPending || updateStandaloneService.isPending} icon={<Save />}>حفظ</Button>
            </div>

            <form id="service-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><CardTitle>بيانات الخدمة</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="اسم الخدمة" htmlFor="name">
                                <Input id="name" value={service.name} onChange={e => setService({...service, name: e.target.value})} required />
                            </FormField>
                            <FormField label="الوصف" htmlFor="description">
                                <Textarea id="description" value={service.description} onChange={e => setService({...service, description: e.target.value})} rows={3} required />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calculator className="text-blue-500"/> تسعير الخدمة</CardTitle>
                            <CardDescription>حدد التكلفة الأساسية (صافي مقدم الخدمة).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <FormField label="صافي التكلفة الافتراضي (ج.م)" htmlFor="price">
                                    <Input 
                                        type="number" 
                                        id="price" 
                                        value={service.price} 
                                        onChange={e => setService({...service, price: parseFloat(e.target.value) || 0})} 
                                        className="font-bold text-lg"
                                    />
                                </FormField>
                                
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <p className="text-[10px] font-black text-blue-700 uppercase mb-1">سعر البيع التقديري</p>
                                    <p className="text-2xl font-black text-blue-600">
                                        {estimatedCustomerPrice} ج.م
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>التصنيف</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="مقدم الخدمة" htmlFor="provider_type">
                                <Select id="provider_type" value={service.provider_type} onChange={e => setService({...service, provider_type: e.target.value as any})}>
                                    <option value="instructor">المدرب</option>
                                    <option value="company">الشركة</option>
                                </Select>
                            </FormField>
                             <label className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20 cursor-pointer">
                                <Checkbox checked={service.requires_file_upload} onCheckedChange={v => setService({...service, requires_file_upload: !!v})} />
                                <span className="text-sm">تتطلب رفع ملف</span>
                            </label>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default AdminServiceDetailPage;
