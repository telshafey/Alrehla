import React, { useState, useMemo } from 'react';
import { Package, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
    const { createPackage, updatePackage, deletePackage } = useCreativeWritingSettingsMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packageToEdit, setPackageToEdit] = useState<CreativeWritingPackage | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof CreativeWritingPackage; direction: 'asc' | 'desc' } | null>({ key: 'price', direction: 'asc' });

    const packages = useMemo(() => {
        let sortableItems = [...(data?.packages || [])];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data?.packages, sortConfig]);

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

    const handleSort = (key: keyof CreativeWritingPackage) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableTh: React.FC<{ sortKey: keyof CreativeWritingPackage; label: string }> = ({ sortKey, label }) => (
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
                                        <SortableTh sortKey="name" label="الباقة" />
                                        <SortableTh sortKey="sessions" label="الجلسات" />
                                        <SortableTh sortKey="price" label="السعر" />
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