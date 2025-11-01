import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
    const { createStandaloneService, updateStandaloneService, deleteStandaloneService } = useCreativeWritingSettingsMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<StandaloneService | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof StandaloneService; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

    const standaloneServices = useMemo(() => {
        let sortableItems = [...(data?.standaloneServices || [])];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data?.standaloneServices, sortConfig]);

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

    const handleSort = (key: keyof StandaloneService) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableTh: React.FC<{ sortKey: keyof StandaloneService; label: string }> = ({ sortKey, label }) => (
        <TableHead>
            <Button variant="ghost" onClick={() => handleSort(sortKey)} className="px-0 h-auto py-0">
                <div className="flex items-center">
                   <span>{label}</span>
                    {sortConfig?.key === sortKey && (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 mr-2" /> : <ArrowDown className="h-4 w-4 mr-2" />
                    )}
                </div>
            </Button>
        </TableHead>
    );
    
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
                                        <SortableTh sortKey="name" label="الخدمة" />
                                        <SortableTh sortKey="category" label="الفئة" />
                                        <SortableTh sortKey="provider_type" label="مقدم الخدمة" />
                                        <SortableTh sortKey="price" label="السعر" />
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