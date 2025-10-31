import React, { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle, Package, Sparkles } from 'lucide-react';
import AdminSection from '../AdminSection';
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

const parseSessions = (sessionString: string): number => {
    if (!sessionString) return 0;
    const match = sessionString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};


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
            for (const [key, value] of Object.entries(instructor.service_rates)) {
                initialRates[key] = value.toString();
            }
            setServiceRates(initialRates);
        }
        if (instructor.package_rates) {
            const initialRates: { [key: string]: string } = {};
            for (const [key, value] of Object.entries(instructor.package_rates)) {
                initialRates[key] = value.toString();
            }
            setPackageRates(initialRates);
        }
    }, [instructor]);
    
    const { standaloneServices = [], packages = [] } = settingsData || {};

    const handleServiceRateChange = (serviceId: number, value: string) => {
        setServiceRates(prev => ({ ...prev, [serviceId]: value }));
    };

    const handlePackageRateChange = (packageId: number, value: string) => {
        setPackageRates(prev => ({ ...prev, [packageId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const numericServiceRates: { [key: string]: number } = {};
        for (const [key, value] of Object.entries(serviceRates)) {
            if (value && !isNaN(parseFloat(String(value)))) {
                numericServiceRates[key] = parseFloat(String(value));
            }
        }
        
        const numericPackageRates: { [key: string]: number } = {};
        for (const [key, value] of Object.entries(packageRates)) {
             if (value && !isNaN(parseFloat(String(value)))) {
                numericPackageRates[key] = parseFloat(String(value));
            }
        }

        const updates: any = {};
        if (parseFloat(ratePerSession) !== instructor.rate_per_session) {
            updates.rate_per_session = parseFloat(ratePerSession);
        }
        updates.service_rates = numericServiceRates;
        updates.package_rates = numericPackageRates;

        requestProfileUpdate.mutate({
            instructorId: instructor.id,
            updates,
            justification
        });
        setJustification('');
    };

    const isUpdatePending = instructor.profile_update_status === 'pending';
    const ratePerSessionNumeric = parseFloat(ratePerSession) || instructor.rate_per_session || 0;

    if (settingsLoading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">التسعير</h1>
            {isUpdatePending && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                    <p className="text-sm font-bold">لديك طلب تحديث قيد المراجعة. لا يمكنك إرسال طلب جديد حتى يتم البت في الطلب الحالي.</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
                <fieldset disabled={isUpdatePending || requestProfileUpdate.isPending} className="space-y-8">
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><DollarSign /> سعر الجلسة الأساسي</CardTitle>
                            <CardDescription>هذا السعر هو الأساس لحساب أسعار الباقات ما لم تحدد سعراً خاصاً لكل باقة.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="السعر المعتمد حالياً" htmlFor="currentRate">
                                <Input id="currentRate" value={`${instructor.rate_per_session || 0} ج.م`} disabled />
                            </FormField>
                            <FormField label="السعر الجديد المقترح" htmlFor="ratePerSession">
                                <Input id="ratePerSession" type="number" value={ratePerSession} onChange={e => setRatePerSession(e.target.value)} />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Package/> تسعير الباقات</CardTitle>
                            <CardDescription>أدخل سعرك الخاص لكل باقة. إذا تركت حقلاً فارغاً، سيتم تطبيق السعر المحسوب تلقائياً.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(packages as CreativeWritingPackage[]).filter(p => p.price > 0).map(pkg => {
                                const numSessions = parseSessions(pkg.sessions);
                                const calculatedPrice = numSessions * ratePerSessionNumeric;
                                return (
                                <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-3 bg-muted/50 rounded-lg">
                                    <FormField label={`${pkg.name} (${pkg.sessions})`} htmlFor={`package-${pkg.id}`}>
                                        <Input
                                            id={`package-${pkg.id}`}
                                            type="number"
                                            placeholder={`السعر الأساسي: ${pkg.price} ج.م`}
                                            value={packageRates[pkg.id] || ''}
                                            onChange={e => handlePackageRateChange(pkg.id, e.target.value)}
                                        />
                                    </FormField>
                                     <div>
                                        <p className="text-xs text-muted-foreground">السعر المحسوب تلقائياً:</p>
                                        <p className="font-semibold">{ isNaN(calculatedPrice) ? '-' : `${calculatedPrice} ج.م`}</p>
                                    </div>
                                </div>
                            )})}
                        </CardContent>
                    </Card>
                    
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles /> تسعير الخدمات الإبداعية</CardTitle>
                            <CardDescription>أدخل سعرك لكل خدمة ترغب في تقديمها. الخدمات التي تتركها فارغة لن تظهرك كمقدم لها.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(standaloneServices as StandaloneService[])
                                .filter(s => s.provider_type === 'instructor')
                                .map(service => (
                                <div key={service.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 bg-muted/50 rounded-lg">
                                    <label htmlFor={`service-${service.id}`} className="font-semibold">{service.name}</label>
                                    <Input
                                        id={`service-${service.id}`}
                                        type="number"
                                        placeholder={`السعر المرجعي: ${service.price} ج.م`}
                                        value={serviceRates[service.id] || ''}
                                        onChange={e => handleServiceRateChange(service.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>تأكيد التغييرات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField label="مبررات طلب التعديل (إلزامي)" htmlFor="justification">
                                <Textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} rows={3} placeholder="مثال: قمت بتحديث الأسعار لتناسب خبرتي وأسعار السوق الحالية." required />
                            </FormField>
                            <div className="flex justify-end mt-4">
                                <Button type="submit" loading={requestProfileUpdate.isPending} icon={<Save />}>
                                    إرسال طلب تحديث الأسعار
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </fieldset>
            </form>
        </div>
    );
};

export default InstructorPricingPanel;