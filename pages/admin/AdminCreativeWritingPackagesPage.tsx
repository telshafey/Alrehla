
import React, { useState, useMemo } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations/useCreativeWritingSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import type { CreativeWritingPackage } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';

const AdminCreativeWritingPackagesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useAdminCWSettings();
    const { deletePackage } = useCreativeWritingSettingsMutations();

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
    
    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة باقات بداية الرحلة</h1>
                <Button onClick={() => navigate('/admin/creative-writing-packages/new')} icon={<Plus size={18} />}>
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
                                    <SortableTableHead<CreativeWritingPackage> sortKey="name" label="الباقة" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<CreativeWritingPackage> sortKey="sessions" label="الجلسات" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<CreativeWritingPackage> sortKey="price" label="السعر" sortConfig={sortConfig} onSort={handleSort} />
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
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/creative-writing-packages/${pkg.id}`)} title="تعديل"><Edit size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePackage(pkg.id)} title="حذف"><Trash2 size={20} /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCreativeWritingPackagesPage;