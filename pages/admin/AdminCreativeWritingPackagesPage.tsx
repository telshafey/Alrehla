import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations/useCreativeWritingSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { CWSettingsModal } from '../../components/admin/CWSettingsModal';
import { Button } from '../../components/ui/Button';
import type { CreativeWritingPackage } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const AdminCreativeWritingPackagesPage: React.FC = () => {
    const { data, isLoading, error, refetch } = useAdminCWSettings();
    const packages = data?.packages || [];
    const { createPackage, updatePackage, deletePackage } = useCreativeWritingSettingsMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packageToEdit, setPackageToEdit] = useState<CreativeWritingPackage | null>(null);
    const isSaving = createPackage.isPending || updatePackage.isPending;

    const handleOpenModal = (pkg: CreativeWritingPackage | null) => {
        setPackageToEdit(pkg);
        setIsModalOpen(true);
    };

    const handleSavePackage = async (payload: any) => {
        try {
            if (payload.id) {
                await updatePackage.mutateAsync(payload);
            } else {
                await createPackage.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) { /* Error handled in hook */ }
    };
    
    const handleDeletePackage = async (packageId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
            await deletePackage.mutateAsync({ packageId });
        }
    };
    
    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <CWSettingsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePackage}
                isSaving={isSaving}
                packageToEdit={packageToEdit}
            />
            <div className="animate-fadeIn space-y-8">
                 <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة باقات بداية الرحلة</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        إضافة باقة
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package /> قائمة الباقات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                        <TableHead>الباقة</TableHead>
                                        <TableHead>الجلسات</TableHead>
                                        <TableHead>السعر</TableHead>
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages.map((pkg: CreativeWritingPackage) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-semibold">{pkg.name} {pkg.popular && <span className="text-xs text-primary">(الأكثر شيوعاً)</span>}</TableCell>
                                            <TableCell>{pkg.sessions}</TableCell>
                                            <TableCell className="font-bold">{pkg.price === 0 ? 'مجانية' : `${pkg.price} ج.م`}</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(pkg)}><Edit size={20} /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePackage(pkg.id)}><Trash2 size={20} /></Button>
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

export default AdminCreativeWritingPackagesPage;