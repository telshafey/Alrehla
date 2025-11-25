
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Tag, Settings, UserCog } from 'lucide-react';
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
import { IconMap } from '../../components/creative-writing/services/IconMap';
import type { StandaloneService } from '../../lib/database.types';

const AdminServiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data, isLoading: settingsLoading } = useAdminCWSettings();
    const { createStandaloneService, updateStandaloneService } = useCreativeWritingSettingsMutations();
    
    const [service, setService] = useState<Partial<StandaloneService>>({
        name: '',
        price: 0,
        description: '',
        category: 'استشارات',
        icon_name: 'MessageSquare',
        requires_file_upload: false,
        provider_type: 'instructor',
    });

    useEffect(() => {
        if (!isNew && data?.standaloneServices) {
            const foundService = data.standaloneServices.find(s => s.id === Number(id));
            if (foundService) {
                setService(foundService);
            } else if (!settingsLoading) {
                navigate('/admin/creative-writing-services');
            }
        }
    }, [id, isNew, data, settingsLoading, navigate]);

    const isSaving = createStandaloneService.isPending || updateStandaloneService.isPending;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setService(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isNew) {
                await createStandaloneService.mutateAsync(service);
            } else {
                await updateStandaloneService.mutateAsync(service);
            }
            navigate('/admin/creative-writing-services');
        } catch (error) {
            console.error("Error saving service:", error);
        }
    };

    if (settingsLoading && !isNew) return <PageLoader text="جاري تحميل بيانات الخدمة..." />;

    return (
        <div className="animate-fadeIn space-y-8">
            <Link to="/admin/creative-writing-services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة إلى قائمة الخدمات
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">
                    {isNew ? 'إضافة خدمة إبداعية جديدة' : `تعديل الخدمة: ${service.name}`}
                </h1>
                <Button type="submit" form="service-form" loading={isSaving} icon={<Save />}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </div>

            <form id="service-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sparkles /> تفاصيل الخدمة</CardTitle>
                                <CardDescription>المعلومات الأساسية التي تصف الخدمة للعميل.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="اسم الخدمة*" htmlFor="name">
                                        <Input id="name" name="name" value={service.name} onChange={handleChange} required />
                                    </FormField>
                                    <FormField label="الفئة*" htmlFor="category">
                                        <Select id="category" name="category" value={service.category} onChange={handleChange}>
                                            <option value="استشارات">استشارات</option>
                                            <option value="مراجعات">مراجعات</option>
                                            <option value="نشر">نشر</option>
                                            <option value="قصص فيديو">قصص فيديو</option>
                                            <option value="قصص مسموعة">قصص مسموعة</option>
                                        </Select>
                                    </FormField>
                                </div>
                                <FormField label="الوصف*" htmlFor="description">
                                    <Textarea id="description" name="description" value={service.description} onChange={handleChange} rows={4} required />
                                </FormField>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Tag /> أيقونة الخدمة</CardTitle>
                                <CardDescription>اختر الأيقونة التي تعبر عن نوع الخدمة بشكل أفضل.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                    {Object.entries(IconMap).map(([iconName, iconComponent]) => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setService(prev => ({ ...prev, icon_name: iconName }))}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${service.icon_name === iconName ? 'bg-primary/10 border-primary ring-2 ring-primary/30' : 'bg-background hover:bg-muted'}`}
                                        >
                                            <div className={`mb-2 ${service.icon_name === iconName ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {iconComponent}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{iconName}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2: Settings & Pricing */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Settings /> الإعدادات والتسعير</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField label="السعر الأساسي (ج.م)*" htmlFor="price">
                                    <div className="relative">
                                        <Input type="number" id="price" name="price" value={service.price} onChange={handleChange} required className="pl-12" />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">ج.م</span>
                                    </div>
                                </FormField>

                                <FormField label="مقدم الخدمة" htmlFor="provider_type">
                                    <Select id="provider_type" name="provider_type" value={service.provider_type} onChange={handleChange}>
                                        <option value="instructor">المدرب (يظهر في ملف المدرب)</option>
                                        <option value="company">الشركة (خدمة مركزية)</option>
                                    </Select>
                                </FormField>
                                
                                <div className="pt-4 border-t">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted transition-colors">
                                        <Checkbox
                                            checked={service.requires_file_upload}
                                            onCheckedChange={(checked) => setService(prev => ({ ...prev, requires_file_upload: !!checked }))}
                                        />
                                        <div>
                                            <span className="font-semibold text-sm">تتطلب رفع ملف</span>
                                            <p className="text-xs text-muted-foreground">يجب على العميل رفع ملف (مثل نص للقصة) عند الطلب.</p>
                                        </div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {service.provider_type === 'instructor' && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800 text-lg"><UserCog size={20}/> تسعير المدربين</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-blue-700">
                                    <p>بما أن هذه الخدمة يقدمها المدرب، فإن السعر المحدد هنا يعتبر سعراً "مرجعياً" أو افتراضياً.</p>
                                    <p className="mt-2">يمكن لكل مدرب تحديد سعره الخاص لهذه الخدمة من خلال لوحة التحكم الخاصة به.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminServiceDetailPage;