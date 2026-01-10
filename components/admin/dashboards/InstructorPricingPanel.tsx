
import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Package, Sparkles, AlertCircle, Calculator, ArrowLeft, Info } from 'lucide-react';
import { Button } from '../../ui/Button';
import FormField from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import { useAdminCWSettings, useAdminPricingSettings } from '../../../hooks/queries/admin/useAdminSettingsQuery';
import type { Instructor } from '../../../lib/database.types';
import PageLoader from '../../ui/PageLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { calculateCustomerPrice } from '../../../utils/pricingCalculator';

interface InstructorPricingPanelProps {
    instructor: Instructor;
}

const InstructorPricingPanel: React.FC<InstructorPricingPanelProps> = ({ instructor }) => {
    const { data: cwSettings, isLoading: cwLoading } = useAdminCWSettings();
    const { data: pricingConfig, isLoading: pricingLoading } = useAdminPricingSettings();
    const { requestProfileUpdate } = useInstructorMutations();
    
    const [ratePerSession, setRatePerSession] = useState(instructor.rate_per_session?.toString() || '');
    const [serviceRates, setServiceRates] = useState<Record<string, string>>({});
    const [packageRates, setPackageRates] = useState<Record<string, string>>({});
    const [justification, setJustification] = useState('');

    useEffect(() => {
        if (instructor.service_rates) {
            const rates: Record<string, string> = {};
            Object.entries(instructor.service_rates).forEach(([k, v]) => rates[k] = v.toString());
            setServiceRates(rates);
        }
        if (instructor.package_rates) {
            const rates: Record<string, string> = {};
            Object.entries(instructor.package_rates).forEach(([k, v]) => rates[k] = v.toString());
            setPackageRates(rates);
        }
    }, [instructor]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const updates = {
            rate_per_session: parseFloat(ratePerSession) || 0,
            service_rates: Object.fromEntries(Object.entries(serviceRates).map(([k, v]) => [k, parseFloat(v as string)])),
            package_rates: Object.fromEntries(Object.entries(packageRates).map(([k, v]) => [k, parseFloat(v as string)])),
        };

        requestProfileUpdate.mutate({
            instructorId: instructor.id,
            updates,
            justification
        });
    };

    if (cwLoading || pricingLoading) return <PageLoader />;

    const { standaloneServices = [], packages = [] } = cwSettings || {};
    const instructorServices = standaloneServices.filter((s: any) => s.provider_type === 'instructor');

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة دخلك المادي</h1>
                    <p className="text-muted-foreground mt-1">حدد "صافي المبلغ" الذي تريده، وسيقوم النظام بحساب السعر النهائي للعميل تلقائياً.</p>
                </div>
                {instructor.profile_update_status === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                        <AlertCircle size={16} /> طلب تحديث الأسعار قيد المراجعة
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                <Info className="text-blue-600 mt-1 shrink-0" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">كيف تعمل الأسعار؟</p>
                    <p>أنت تدخل <strong>صافي ربحك</strong> فقط. المنصة تضيف تلقائياً نسبة التشغيل والرسوم الإدارية ليظهر السعر النهائي لولي الأمر.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. السعر الأساسي */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign /> سعرك الأساسي للجلسة</CardTitle>
                        <CardDescription>هذا هو السعر المرجعي للجلسة الواحدة (45 دقيقة).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-gray-700 mb-2">صافي دخلك (ج.م)</label>
                                <Input 
                                    type="number" 
                                    value={ratePerSession} 
                                    onChange={e => setRatePerSession(e.target.value)} 
                                    className="text-lg font-bold h-12"
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground mt-1">المبلغ الذي سيصل لحسابك.</p>
                            </div>
                            
                            <ArrowLeft className="hidden md:block text-gray-400" />
                            <div className="md:hidden w-full h-px bg-gray-300 my-2"></div>

                            <div className="flex-1 w-full bg-white p-4 rounded-lg border border-blue-100 shadow-sm text-center">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">السعر النهائي للعميل</p>
                                <p className="text-3xl font-black text-blue-600">
                                    {calculateCustomerPrice(parseFloat(ratePerSession), pricingConfig)} <span className="text-sm font-medium text-gray-400">ج.م</span>
                                </p>
                                <p className="text-[10px] text-green-600 mt-1 font-semibold flex items-center justify-center gap-1">
                                    <Calculator size={10} /> شامل عمولة المنصة والرسوم
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. تسعير الباقات */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package /> تسعير الباقات (الجملة)</CardTitle>
                        <CardDescription>حدد صافي دخلك من كل باقة كاملة. عادة ما يكون أقل قليلاً من سعر الجلسة الفردية لتشجيع الاشتراكات.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {packages.filter((p: any) => p.price > 0).map((pkg: any) => {
                            const netPrice = parseFloat(packageRates[pkg.id] || '0');
                            const customerPrice = calculateCustomerPrice(netPrice, pricingConfig);
                            return (
                                <div key={pkg.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-full md:w-1/3">
                                        <p className="font-bold text-gray-800">{pkg.name}</p>
                                        <p className="text-sm text-muted-foreground">{pkg.sessions}</p>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="relative">
                                            <Input 
                                                type="number" 
                                                placeholder="أدخل صافي ربحك"
                                                value={packageRates[pkg.id] || ''}
                                                onChange={e => setPackageRates({...packageRates, [pkg.id]: e.target.value})}
                                                className="pl-16 font-semibold"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded">صافي</span>
                                        </div>
                                    </div>
                                    <div className="md:w-1/4 text-center md:text-left">
                                        <p className="text-xs text-muted-foreground">يظهر للعميل بـ</p>
                                        <p className="font-bold text-lg text-blue-600">{customerPrice} ج.م</p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* 3. الخدمات الإضافية */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles /> الخدمات الإضافية</CardTitle>
                        <CardDescription>حدد سعرك للخدمات التي تقدمها خارج نطاق الجلسات المعتادة.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {instructorServices.map((service: any) => {
                            const netPrice = parseFloat(serviceRates[service.id] || '0');
                            const customerPrice = calculateCustomerPrice(netPrice, pricingConfig);
                            return (
                                <div key={service.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-full md:w-1/3">
                                        <p className="font-bold text-gray-800">{service.name}</p>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="relative">
                                            <Input 
                                                type="number" 
                                                placeholder="أدخل صافي ربحك"
                                                value={serviceRates[service.id] || ''}
                                                onChange={e => setServiceRates({...serviceRates, [service.id]: e.target.value})}
                                                className="pl-16 font-semibold"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded">صافي</span>
                                        </div>
                                    </div>
                                    <div className="md:w-1/4 text-center md:text-left">
                                        <p className="text-xs text-muted-foreground">يظهر للعميل بـ</p>
                                        <p className="font-bold text-lg text-green-600">{customerPrice} ج.م</p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <FormField label="مبرر طلب تعديل الأسعار (مطلوب للمراجعة)" htmlFor="justification">
                            <Textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} required placeholder="لماذا تقوم بتغيير الأسعار؟ (مثال: زيادة الخبرة، تغيير في هيكل الجلسات...)" rows={2} />
                        </FormField>
                        <div className="mt-6">
                            <Button type="submit" className="w-full h-12 text-lg shadow-lg" loading={requestProfileUpdate.isPending} icon={<Save />}>
                                إرسال الأسعار الجديدة للاعتماد
                            </Button>
                            <p className="text-center text-xs text-muted-foreground mt-3">سيقوم المشرف بمراجعة الأسعار قبل نشرها على الموقع.</p>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default InstructorPricingPanel;
