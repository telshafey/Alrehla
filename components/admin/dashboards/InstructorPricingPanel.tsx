
import React, { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle, Package, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';
import FormField from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import { useAdminCWSettings } from '../../../hooks/queries/admin/useAdminSettingsQuery';
import type { Instructor, StandaloneService, CreativeWritingPackage } from '../../../lib/database.types';
import PageLoader from '../../ui/PageLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface InstructorPricingPanelProps {
    instructor: Instructor;
}

const InstructorPricingPanel: React.FC<InstructorPricingPanelProps> = ({ instructor }) => {
    const { data: settingsData, isLoading: settingsLoading } = useAdminCWSettings();
    const { requestProfileUpdate } = useInstructorMutations();
    
    const [ratePerSession, setRatePerSession] = useState(instructor.rate_per_session?.toString() || '');
    const [serviceRates, setServiceRates] = useState<{ [key: string]: string }>({});
    const [packageRates, setPackageRates] = useState<{ [key: string]: string }>({});
    const [justification, setJustification] = useState('');

    useEffect(() => {
        if (instructor.service_rates) {
            const initialRates: { [key: string]: string } = {};
            Object.entries(instructor.service_rates).forEach(([key, value]) => {
                initialRates[key] = value.toString();
            });
            setServiceRates(initialRates);
        }
        if (instructor.package_rates) {
            const initialRates: { [key: string]: string } = {};
            Object.entries(instructor.package_rates).forEach(([key, value]) => {
                initialRates[key] = value.toString();
            });
            setPackageRates(initialRates);
        }
    }, [instructor]);
    
    const { standaloneServices = [], packages = [] } = settingsData || {};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const updates: any = {
            rate_per_session: parseFloat(ratePerSession) || 0,
            // Added explicit cast (v as string) to satisfy parseFloat parameter requirements
            service_rates: Object.fromEntries(Object.entries(serviceRates).map(([k, v]) => [k, parseFloat(v as string)])),
            // Added explicit cast (v as string) to satisfy parseFloat parameter requirements
            package_rates: Object.fromEntries(Object.entries(packageRates).map(([k, v]) => [k, parseFloat(v as string)])),
        };

        requestProfileUpdate.mutate({
            instructorId: instructor.id,
            updates,
            justification
        });
    };

    if (settingsLoading) return <PageLoader />;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">إعدادات التسعير</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign /> سعرك الأساسي للجلسة</CardTitle>
                        <CardDescription>هذا المبلغ هو ما ستتقاضاه مقابل كل جلسة تدريبية (45 دقيقة).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField label="السعر المطلوب (ج.م)" htmlFor="rate">
                            <Input id="rate" type="number" value={ratePerSession} onChange={e => setRatePerSession(e.target.value)} required />
                        </FormField>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Package /> تسعير الباقات المخصص</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {packages.filter((p:any) => p.price > 0).map((pkg: any) => (
                            <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 border rounded-lg">
                                <label className="text-sm font-bold">{pkg.name} ({pkg.sessions})</label>
                                <Input 
                                    type="number" 
                                    placeholder="سعرك المخصص للباقة"
                                    value={packageRates[pkg.id] || ''}
                                    onChange={e => setPackageRates({...packageRates, [pkg.id]: e.target.value})}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles /> تسعير الخدمات الإضافية</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {standaloneServices.filter((s:any) => s.provider_type === 'instructor').map((service: any) => (
                            <div key={service.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 border rounded-lg">
                                <label className="text-sm font-bold">{service.name}</label>
                                <Input 
                                    type="number" 
                                    placeholder="سعرك لهذه الخدمة"
                                    value={serviceRates[service.id] || ''}
                                    onChange={e => setServiceRates({...serviceRates, [service.id]: e.target.value})}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <FormField label="مبرر طلب تعديل الأسعار" htmlFor="justification">
                            <Textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} required placeholder="لماذا تطلب تعديل أسعارك؟ (سيظهر للإدارة)" />
                        </FormField>
                        <Button type="submit" className="w-full mt-4" loading={requestProfileUpdate.isPending} icon={<Save />}>إرسال طلب مراجعة الأسعار</Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default InstructorPricingPanel;
