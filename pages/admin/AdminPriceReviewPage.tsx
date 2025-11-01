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

    if (isLoading || !pricingSettings || Object.keys(editableRates).length === 0 && instructors.length > 0) {
        return <PageLoader text="جاري تحميل بيانات التسعير..." />;
    }

    if (error) {
        return <ErrorState message={(error as Error).message} onRetry={() => { refetchInstructors(); refetchSettings(); refetchPricing(); }} />;
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
    
    const handleServiceBasePriceChange = (serviceId: number, value: string) => {
        setEditableServices(prev => prev.map(s => s.id === serviceId ? { ...s, price: parseFloat(value) || 0 } : s));
    };

    const handlePackageBasePriceChange = (packageId: number, value: string) => {
        setEditablePackages(prev => prev.map(p => p.id === packageId ? { ...p, price: parseFloat(value) || 0 } : p));
    };


    const handleSave = async () => {
        const updatePromises: Promise<any>[] = [];
        
        // Save instructor-specific rates
        instructors.forEach(instructor => {
            const originalServiceRates = instructor.service_rates || {};
            const originalPackageRates = instructor.package_rates || {};
            const newServiceRates = editableRates[instructor.id]?.service_rates || {};
            const newPackageRates = editableRates[instructor.id]?.package_rates || {};

            if (JSON.stringify(originalServiceRates) !== JSON.stringify(newServiceRates) || JSON.stringify(originalPackageRates) !== JSON.stringify(newPackageRates)) {
                updatePromises.push(updateInstructor.mutateAsync({ id: instructor.id, service_rates: newServiceRates, package_rates: newPackageRates }));
            }
        });

        // Save service base prices
        (settings?.standaloneServices || []).forEach((originalService: StandaloneService) => {
            const editedService = editableServices.find(s => s.id === originalService.id);
            if (editedService && editedService.price !== originalService.price) {
                updatePromises.push(updateStandaloneService.mutateAsync(editedService));
            }
        });

        // Save package base prices
        (settings?.packages || []).forEach((originalPackage: CreativeWritingPackage) => {
            const editedPackage = editablePackages.find(p => p.id === originalPackage.id);
            if (editedPackage && editedPackage.price !== originalPackage.price) {
                updatePromises.push(updatePackage.mutateAsync(editedPackage));
            }
        });

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            addToast(`تم حفظ ${updatePromises.length} تحديثات بنجاح.`, 'success');
        } else {
            addToast('لا توجد تغييرات لحفظها.', 'info');
        }
    };


    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">مراجعة تسعير المدربين</h1>
                <Button onClick={handleSave} loading={isSaving} icon={<Save />}>
                    حفظ التغييرات
                </Button>
            </div>
            
             <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <p className="text-sm font-bold text-blue-800">المعادلة الحالية للتسعير النهائي:</p>
                    <p className="text-lg font-mono text-center mt-2">
                        السعر النهائي = (سعر المدرب * {pricingSettings.company_percentage}) + {pricingSettings.fixed_fee} ج.م
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
                        <CardHeader>
                            <CardTitle>مصفوفة أسعار الخدمات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">الخدمة</TableHead>
                                            <TableHead>السعر الأساسي</TableHead>
                                            {instructors.map(instructor => <TableHead key={instructor.id} className="text-center min-w-[150px]">{instructor.name}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instructorServices.map((service: any) => {
                                            const currentService = editableServices.find(s => s.id === service.id);
                                            return (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-semibold sticky left-0 bg-background z-10">{service.name}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        className="w-24 h-8 text-center"
                                                        value={currentService?.price || ''}
                                                        onChange={(e) => handleServiceBasePriceChange(service.id, e.target.value)}
                                                    />
                                                </TableCell>
                                                {instructors.map(instructor => {
                                                    const instructorPrice = editableRates[instructor.id]?.service_rates?.[service.id];
                                                    const hasPrice = instructorPrice !== undefined && instructorPrice !== null;
                                                    const finalPrice = hasPrice ? (instructorPrice * pricingSettings.company_percentage) + pricingSettings.fixed_fee : null;

                                                    return (
                                                        <TableCell key={instructor.id} className="text-center">
                                                            <div>
                                                                <p className="font-bold">{finalPrice ? `${finalPrice.toFixed(0)} ج.م` : '-'}</p>
                                                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                                                    <span>(</span>
                                                                    <Input
                                                                        type="number"
                                                                        className="w-20 h-6 text-center text-xs p-1"
                                                                        placeholder="-"
                                                                        value={hasPrice ? instructorPrice : ''}
                                                                        onChange={(e) => handleRateChange(instructor.id, 'service', service.id, e.target.value)}
                                                                    />
                                                                    <span>)</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="packages">
                    <Card>
                        <CardHeader>
                            <CardTitle>مصفوفة أسعار الباقات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">الباقة</TableHead>
                                            <TableHead>السعر الأساسي</TableHead>
                                            {instructors.map(instructor => <TableHead key={instructor.id} className="text-center min-w-[150px]">{instructor.name}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.map((pkg: any) => {
                                             const currentPackage = editablePackages.find(p => p.id === pkg.id);
                                             return (
                                            <TableRow key={pkg.id}>
                                                <TableCell className="font-semibold sticky left-0 bg-background z-10">{pkg.name}</TableCell>
                                                <TableCell>
                                                    {pkg.price === 0 ? <span className="text-muted-foreground">مجانية</span> : (
                                                        <Input
                                                            type="number"
                                                            className="w-24 h-8 text-center"
                                                            value={currentPackage?.price || ''}
                                                            onChange={(e) => handlePackageBasePriceChange(pkg.id, e.target.value)}
                                                        />
                                                    )}
                                                </TableCell>
                                                {instructors.map(instructor => {
                                                    const instructorPrice = editableRates[instructor.id]?.package_rates?.[pkg.id];
                                                    const hasPrice = instructorPrice !== undefined && instructorPrice !== null;
                                                    const finalPrice = hasPrice ? (instructorPrice * pricingSettings.company_percentage) + pricingSettings.fixed_fee : null;

                                                    return (
                                                         <TableCell key={instructor.id} className="text-center">
                                                            {pkg.price === 0 ? <span className="text-muted-foreground">-</span> : (
                                                                <div>
                                                                    <p className="font-bold">{finalPrice ? `${finalPrice.toFixed(0)} ج.م` : '-'}</p>
                                                                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                                                        <span>(</span>
                                                                        <Input
                                                                            type="number"
                                                                            className="w-20 h-6 text-center text-xs p-1"
                                                                            placeholder="-"
                                                                            value={hasPrice ? instructorPrice : ''}
                                                                            onChange={(e) => handleRateChange(instructor.id, 'package', pkg.id, e.target.value)}
                                                                        />
                                                                        <span>)</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        )})}
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
