
import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Package, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import FormField from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import { useAdminCWSettings, useAdminPricingSettings } from '../../../hooks/queries/admin/useAdminSettingsQuery';
import type { Instructor } from '../../../lib/database.types';
import PageLoader from '../../ui/PageLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

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

    const calculateCustomerPrice = (netPrice: string) => {
        const net = parseFloat(netPrice) || 0;
        if (!pricingConfig) return net;
        return Math.ceil((net * pricingConfig.company_percentage) + pricingConfig.fixed_fee);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const updates = {
            rate_per_session: parseFloat(ratePerSession) || 0,
            // Added explicit cast to string for v to satisfy parseFloat requirements and resolve 'unknown' type error
            service_rates: Object.fromEntries(Object.entries(serviceRates).map(([k, v]) => [k, parseFloat(v as string)])),
            // Added explicit cast to string for v to satisfy parseFloat requirements and resolve 'unknown' type error
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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة دخلك المادي</h1>
                    <p className="text-muted-foreground mt-1">حدد المبلغ الذي ترغب في استلامه (صافي الربح) لكل خدمة.</p>
                </div>
                {instructor.profile_update_status === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                        <AlertCircle size={16} /> طلب تحديث الأسعار قيد المراجعة
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. السعر الأساسي */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign /> سعرك الأساسي للجلسة (صافي)</CardTitle>
                        <CardDescription>المبلغ الذي ستحصل عليه مقابل كل جلسة تدريبية (45 دقيقة).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <FormField label="سعرك المطلوب (ج.م)" htmlFor="rate">
                                <Input id="rate" type="number" value={ratePerSession} onChange={e => setRatePerSession(e.target.value)} required />
                            </FormField>
                            <div className="bg-muted p-4 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground mb-1">سيظهر للعميل بـ:</p>
                                <p className="text-2xl font-black text-primary">{calculateCustomerPrice(ratePerSession)} ج.م</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. تسعير الباقات */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package /> تسعير الباقات المخصص (صافي)</CardTitle>
                        <CardDescription>حدد دخلك من كل باقة اشتراك.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {packages.filter((p: any) => p.price > 0).map((pkg: any) => (
                            <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-xl bg-gray-50/50">
                                <div className="font-bold text-sm">{pkg.name} ({pkg.sessions})</div>
                                <Input 
                                    type="number" 
                                    placeholder="صافي ربحك"
                                    value={packageRates[pkg.id] || ''}
                                    onChange={e => setPackageRates({...packageRates, [pkg.id]: e.target.value})}
                                />
                                <div className="text-left text-xs font-bold text-green-600">
                                    للعميل: {calculateCustomerPrice(packageRates[pkg.id] || '0')} ج.م
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 3. الخدمات الإضافية */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles /> تسعير الخدمات الإضافية (صافي)</CardTitle>
                        <CardDescription>حدد دخلك من الخدمات التي تقدمها بشكل منفرد.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {instructorServices.map((service: any) => (
                            <div key={service.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-xl bg-gray-50/50">
                                <div className="font-bold text-sm">{service.name}</div>
                                <Input 
                                    type="number" 
                                    placeholder="صافي ربحك"
                                    value={serviceRates[service.id] || ''}
                                    onChange={e => setServiceRates({...serviceRates, [service.id]: e.target.value})}
                                />
                                <div className="text-left text-xs font-bold text-green-600">
                                    للعميل: {calculateCustomerPrice(serviceRates[service.id] || '0')} ج.م
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <FormField label="مبرر طلب تعديل الأسعار" htmlFor="justification">
                            <Textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} required placeholder="اكتب سبباً مختصراً لتغيير الأسعار ليراجعه المدير..." />
                        </FormField>
                        <Button type="submit" className="w-full mt-6" loading={requestProfileUpdate.isPending} icon={<Save />}>
                            إرسال الأسعار للمراجعة والاعتماد
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default InstructorPricingPanel;
