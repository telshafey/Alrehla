import React from 'react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminCWSettings, useAdminPricingSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DollarSign, Package, Sparkles } from 'lucide-react';

const AdminPriceReviewPage: React.FC = () => {
    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { data: settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useAdminCWSettings();
    const { data: pricingSettings, isLoading: pricingLoading, error: pricingError, refetch: refetchPricing } = useAdminPricingSettings();
    
    const isLoading = instructorsLoading || settingsLoading || pricingLoading;
    const error = instructorsError || settingsError || pricingError;

    if (isLoading || !pricingSettings) {
        return <PageLoader text="جاري تحميل بيانات التسعير..." />;
    }

    if (error) {
        return <ErrorState message={(error as Error).message} onRetry={() => { refetchInstructors(); refetchSettings(); refetchPricing(); }} />;
    }

    const { standaloneServices = [], packages = [] } = settings || {};
    const instructorServices = standaloneServices.filter((s: any) => s.provider_type === 'instructor');

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">مراجعة تسعير المدربين</h1>
            
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
                                            {instructors.map(instructor => <TableHead key={instructor.id} className="text-center">{instructor.name}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instructorServices.map((service: any) => (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-semibold sticky left-0 bg-background z-10">{service.name}</TableCell>
                                                <TableCell className="font-bold">{service.price} ج.م</TableCell>
                                                {instructors.map(instructor => (
                                                    <TableCell key={instructor.id} className="text-center font-mono">
                                                        {instructor.service_rates?.[service.id] !== undefined 
                                                            ? (() => {
                                                                const instructorPrice = instructor.service_rates[service.id];
                                                                const finalPrice = (instructorPrice * pricingSettings.company_percentage) + pricingSettings.fixed_fee;
                                                                return (
                                                                    <div>
                                                                        <p className="font-bold">{finalPrice.toFixed(0)} ج.م</p>
                                                                        <p className="text-xs text-muted-foreground">({instructorPrice} ج.م)</p>
                                                                    </div>
                                                                )
                                                            })()
                                                            : <span className="text-muted-foreground">-</span>}
                                                    </TableCell>
                                                ))}
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
                                            {instructors.map(instructor => <TableHead key={instructor.id} className="text-center">{instructor.name}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.map((pkg: any) => (
                                            <TableRow key={pkg.id}>
                                                <TableCell className="font-semibold sticky left-0 bg-background z-10">{pkg.name}</TableCell>
                                                <TableCell className="font-bold">{pkg.price === 0 ? 'مجانية' : `${pkg.price} ج.م`}</TableCell>
                                                {instructors.map(instructor => (
                                                    <TableCell key={instructor.id} className="text-center font-mono">
                                                         {instructor.package_rates?.[pkg.id] !== undefined
                                                            ? (() => {
                                                                const instructorPrice = instructor.package_rates[pkg.id];
                                                                const finalPrice = (instructorPrice * pricingSettings.company_percentage) + pricingSettings.fixed_fee;
                                                                return (
                                                                    <div>
                                                                        <p className="font-bold">{finalPrice.toFixed(0)} ج.م</p>
                                                                        <p className="text-xs text-muted-foreground">({instructorPrice} ج.م)</p>
                                                                    </div>
                                                                )
                                                            })()
                                                            : <span className="text-muted-foreground">-</span>}
                                                    </TableCell>
                                                ))}
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