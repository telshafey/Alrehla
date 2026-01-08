
import React, { useState, useEffect, useMemo } from 'react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminCWSettings, useAdminPricingSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import { useToast } from '../../contexts/ToastContext';
import PageLoader from '../../components/ui/PageLoader';
import { Card } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Package, Sparkles, Save, Calculator } from 'lucide-react';
import { calculateCustomerPrice, calculatePlatformMargin } from '../../utils/pricingCalculator';

type EditableRates = {
    [instructorId: number]: {
        service_rates: { [serviceId: number]: number | undefined };
        package_rates: { [packageId: number]: number | undefined };
    }
}

const AdminPriceReviewPage: React.FC = () => {
    const { data: instructors = [], isLoading: instructorsLoading, refetch: refetchInstructors } = useAdminInstructors();
    const { data: settings, isLoading: settingsLoading } = useAdminCWSettings();
    const { data: pricingConfig, isLoading: pricingLoading } = useAdminPricingSettings();
    const { updateInstructor } = useInstructorMutations();
    const { addToast } = useToast();
    
    const [editableRates, setEditableRates] = useState<EditableRates>({});

    useEffect(() => {
        if (instructors.length > 0) {
            const initialRates = instructors.reduce((acc, instructor) => {
                acc[instructor.id] = {
                    service_rates: instructor.service_rates || {},
                    package_rates: instructor.package_rates || {},
                };
                return acc;
            }, {} as EditableRates);
            setEditableRates(initialRates);
        }
    }, [instructors]);

    const handleRateChange = (instructorId: number, type: 'service' | 'package', itemId: number, value: string) => {
        const rateKey = type === 'service' ? 'service_rates' : 'package_rates';
        const numericValue = value === '' ? undefined : parseFloat(value);
        
        setEditableRates(prev => ({
            ...prev,
            [instructorId]: {
                ...prev[instructorId],
                [rateKey]: {
                    ...prev[instructorId]?.[rateKey],
                    [itemId]: numericValue
                }
            }
        }));
    };
    
    const handleSave = async () => {
        const updatePromises: Promise<any>[] = [];
        instructors.forEach(instructor => {
            const rates = editableRates[instructor.id];
            if (rates) {
                updatePromises.push(updateInstructor.mutateAsync({ 
                    id: instructor.id, 
                    service_rates: rates.service_rates, 
                    package_rates: rates.package_rates 
                }));
            }
        });

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            addToast(`تم تحديث مصفوفة الأسعار بنجاح.`, 'success');
            refetchInstructors();
        }
    };

    if (instructorsLoading || settingsLoading || pricingLoading) return <PageLoader />;

    const instructorServices = (settings?.standaloneServices || []).filter((s: any) => s.provider_type === 'instructor');
    const packages = (settings?.packages || []).filter((p: any) => p.price > 0);

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
                        <Calculator className="text-primary" /> مصفوفة الأسعار والعمولات
                    </h1>
                    <p className="text-muted-foreground mt-1">تحديد صافي المدرب واحتساب عمولة المنصة آلياً.</p>
                </div>
                <Button onClick={handleSave} loading={updateInstructor.isPending} icon={<Save />} size="lg">حفظ التغييرات</Button>
            </div>

            <Tabs defaultValue="packages">
                <TabsList>
                    <TabsTrigger value="packages" className="gap-2"><Package size={16}/> الباقات</TabsTrigger>
                    <TabsTrigger value="services" className="gap-2"><Sparkles size={16}/> الخدمات</TabsTrigger>
                </TabsList>

                <TabsContent value="packages" className="mt-6">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="sticky right-0 bg-muted/80 z-20 w-[200px] border-l">الباقة / المدرب</TableHead>
                                        {instructors.map(inst => (
                                            <TableHead key={inst.id} className="text-center min-w-[200px] p-4">
                                                <span className="text-xs">{inst.name}</span>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages.map((pkg: any) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-bold sticky right-0 bg-white z-10 border-l shadow-sm">
                                                {pkg.name}
                                                <p className="text-[9px] text-muted-foreground font-normal">الافتراضي: {pkg.price} ج.م</p>
                                            </TableCell>
                                            {instructors.map(inst => {
                                                const net = editableRates[inst.id]?.package_rates?.[pkg.id] ?? pkg.price;
                                                const customerPrice = calculateCustomerPrice(net, pricingConfig);
                                                const platformMargin = calculatePlatformMargin(customerPrice, net || 0);
                                                return (
                                                    <TableCell key={inst.id} className="text-center p-4">
                                                        <div className="space-y-2">
                                                            <Input 
                                                                type="number" 
                                                                className="text-center h-8 font-bold"
                                                                value={net ?? ''} 
                                                                onChange={e => handleRateChange(inst.id, 'package', pkg.id, e.target.value)}
                                                            />
                                                            <div className="flex justify-between items-center px-1">
                                                                <div className="text-[10px] text-green-600 font-bold">للعميل: {customerPrice}</div>
                                                                <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">ربحك: {platformMargin}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
                
                <TabsContent value="services" className="mt-6">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="sticky right-0 bg-muted/80 z-20 w-[200px] border-l">الخدمة / المدرب</TableHead>
                                        {instructors.map(inst => (
                                            <TableHead key={inst.id} className="text-center min-w-[200px] p-4">
                                                <span className="text-xs">{inst.name}</span>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {instructorServices.map((service: any) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-bold sticky right-0 bg-white z-10 border-l shadow-sm">
                                                {service.name}
                                                <p className="text-[9px] text-muted-foreground font-normal">الافتراضي: {service.price} ج.م</p>
                                            </TableCell>
                                            {instructors.map(inst => {
                                                const net = editableRates[inst.id]?.service_rates?.[service.id] ?? service.price;
                                                const customerPrice = calculateCustomerPrice(net, pricingConfig);
                                                const platformMargin = calculatePlatformMargin(customerPrice, net || 0);
                                                return (
                                                    <TableCell key={inst.id} className="text-center p-4">
                                                        <div className="space-y-2">
                                                            <Input 
                                                                type="number" 
                                                                className="text-center h-8 font-bold"
                                                                value={net ?? ''} 
                                                                onChange={e => handleRateChange(inst.id, 'service', service.id, e.target.value)}
                                                            />
                                                            <div className="flex justify-between items-center px-1">
                                                                <div className="text-[10px] text-green-600 font-bold">للعميل: {customerPrice}</div>
                                                                <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">ربحك: {platformMargin}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPriceReviewPage;
