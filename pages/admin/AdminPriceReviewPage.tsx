
import React, { useState, useEffect } from 'react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminCWSettings, useAdminPricingSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations/useCreativeWritingSettingsMutations';
import { useToast } from '../../contexts/ToastContext';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DollarSign, Package, Sparkles, Save } from 'lucide-react';
import type { StandaloneService, CreativeWritingPackage } from '../../lib/database.types';

type EditableRates = {
    [instructorId: number]: {
        service_rates: { [serviceId: number]: number | undefined };
        package_rates: { [packageId: number]: number | undefined };
    }
}

const AdminPriceReviewPage: React.FC = () => {
    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { data: settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useAdminCWSettings();
    const { data: pricingSettings, isLoading: pricingLoading, error: pricingError, refetch: refetchPricing } = useAdminPricingSettings();
    const { updateInstructor } = useInstructorMutations();
    const { updateStandaloneService, updatePackage } = useCreativeWritingSettingsMutations();
    const { addToast } = useToast();
    
    const [editableRates, setEditableRates] = useState<EditableRates>({});
    const [editableServices, setEditableServices] = useState<StandaloneService[]>([]);
    const [editablePackages, setEditablePackages] = useState<CreativeWritingPackage[]>([]);

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

    useEffect(() => {
        if (settings?.standaloneServices) {
            setEditableServices(JSON.parse(JSON.stringify(settings.standaloneServices)));
        }
        if (settings?.packages) {
            setEditablePackages(JSON.parse(JSON.stringify(settings.packages)));
        }
    }, [settings]);

    const isLoading = instructorsLoading || settingsLoading || pricingLoading;
    const isSaving = updateInstructor.isPending || updateStandaloneService.isPending || updatePackage.isPending;
    const error = instructorsError || settingsError || pricingError;

    if (isLoading || !pricingSettings || (Object.keys(editableRates).length === 0 && instructors.length > 0)) {
        return <PageLoader text="جاري تحميل مصفوفة الأسعار..." />;
    }

    const { standaloneServices = [], packages = [] } = settings || {};
    const instructorServices = standaloneServices.filter((s: any) => s.provider_type === 'instructor');

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
            const newServiceRates = editableRates[instructor.id]?.service_rates || {};
            const newPackageRates = editableRates[instructor.id]?.package_rates || {};

            if (JSON.stringify(instructor.service_rates) !== JSON.stringify(newServiceRates) || 
                JSON.stringify(instructor.package_rates) !== JSON.stringify(newPackageRates)) {
                updatePromises.push(updateInstructor.mutateAsync({ 
                    id: instructor.id, 
                    service_rates: newServiceRates, 
                    package_rates: newPackageRates 
                }));
            }
        });

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            addToast(`تم حفظ تعديلات الأسعار بنجاح.`, 'success');
        } else {
            addToast('لا توجد تغييرات لحفظها.', 'info');
        }
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">مراجعة تسعير المدربين</h1>
                <Button onClick={handleSave} loading={isSaving} icon={<Save />}>حفظ كل التغييرات</Button>
            </div>
            
             <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <p className="text-sm font-bold text-blue-800">قاعدة احتساب السعر للعميل:</p>
                    <p className="text-lg font-mono text-center mt-2">
                        السعر النهائي = (سعر المدرب المختار * {pricingSettings.company_percentage}) + {pricingSettings.fixed_fee} ج.م
                    </p>
                </CardContent>
            </Card>

            <Tabs defaultValue="services">
                <TabsList>
                    <TabsTrigger value="services"><Sparkles className="ml-2" /> أسعار الخدمات</TabsTrigger>
                    <TabsTrigger value="packages"><Package className="ml-2" /> أسعار الباقات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="services">
                    <Card>
                        <CardHeader><CardTitle>مصفوفة خدمات المدربين</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky right-0 bg-background z-10 min-w-[200px]">الخدمة</TableHead>
                                            {instructors.map(inst => <TableHead key={inst.id} className="text-center min-w-[120px]">{inst.name}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instructorServices.map((service: any) => (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-semibold sticky right-0 bg-background z-10 border-l shadow-sm">{service.name}</TableCell>
                                                {instructors.map(instructor => {
                                                    const instrPrice = editableRates[instructor.id]?.service_rates?.[service.id];
                                                    return (
                                                        <TableCell key={instructor.id} className="text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    className="w-24 h-8 text-center text-xs"
                                                                    placeholder="-"
                                                                    value={instrPrice || ''}
                                                                    onChange={(e) => handleRateChange(instructor.id, 'service', service.id, e.target.value)}
                                                                />
                                                                {instrPrice && (
                                                                    <span className="text-[10px] text-green-600 font-bold">
                                                                        ={(instrPrice * pricingSettings.company_percentage + pricingSettings.fixed_fee).toFixed(0)} للعميل
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="packages">
                     <Card>
                        <CardHeader><CardTitle>مصفوفة باقات المدربين</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky right-0 bg-background z-10 min-w-[200px]">الباقة</TableHead>
                                            {instructors.map(inst => <TableHead key={inst.id} className="text-center min-w-[120px]">{inst.name}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.filter((p: any) => p.price > 0).map((pkg: any) => (
                                            <TableRow key={pkg.id}>
                                                <TableCell className="font-semibold sticky right-0 bg-background z-10 border-l shadow-sm">{pkg.name}</TableCell>
                                                {instructors.map(instructor => {
                                                    const instrPrice = editableRates[instructor.id]?.package_rates?.[pkg.id];
                                                    return (
                                                        <TableCell key={instructor.id} className="text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    className="w-24 h-8 text-center text-xs"
                                                                    placeholder="-"
                                                                    value={instrPrice || ''}
                                                                    onChange={(e) => handleRateChange(instructor.id, 'package', pkg.id, e.target.value)}
                                                                />
                                                                {instrPrice && (
                                                                    <span className="text-[10px] text-green-600 font-bold">
                                                                        ={(instrPrice * pricingSettings.company_percentage + pricingSettings.fixed_fee).toFixed(0)} للعميل
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPriceReviewPage;
