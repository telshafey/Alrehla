import React, { useState } from 'react';
import { Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations/useCreativeWritingSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { ServiceSettingsModal } from '../../components/admin/ServiceSettingsModal';
import { Button } from '../../components/ui/Button';
import type { StandaloneService } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const AdminCreativeWritingServicesPage: React.FC = () => {
    const { data, isLoading, error, refetch } = useAdminCWSettings();
    const standaloneServices = data?.standaloneServices || [];
    const { createStandaloneService, updateStandaloneService, deleteStandaloneService } = useCreativeWritingSettingsMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<StandaloneService | null>(null);
    const isSaving = createStandaloneService.isPending || updateStandaloneService.isPending;

    const handleOpenModal = (service: StandaloneService | null) => {
        setServiceToEdit(service);
        setIsModalOpen(true);
    };

    const handleSaveService = async (payload: any) => {
        try {
            if (payload.id) {
                await updateStandaloneService.mutateAsync(payload);
            } else {
                await createStandaloneService.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) { /* Error handled in hook */ }
    };

    const handleDeleteService = async (serviceId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            await deleteStandaloneService.mutateAsync({ serviceId });
        }
    };
    
    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ServiceSettingsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveService}
                isSaving={isSaving}
                serviceToEdit={serviceToEdit}
            />
            <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة الخدمات الإبداعية</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        إضافة خدمة
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles /> قائمة الخدمات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                        <TableHead>الخدمة</TableHead>
                                        <TableHead>الفئة</TableHead>
                                        <TableHead>مقدم الخدمة</TableHead>
                                        <TableHead>السعر</TableHead>
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {standaloneServices.map((service: StandaloneService) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-semibold">{service.name}</TableCell>
                                            <TableCell>{service.category}</TableCell>
                                            <TableCell>{service.provider_type === 'company' ? 'الشركة' : 'المدرب'}</TableCell>
                                            <TableCell className="font-bold">{service.price} ج.م</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(service)}><Edit size={20} /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteService(service.id)}><Trash2 size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminCreativeWritingServicesPage;