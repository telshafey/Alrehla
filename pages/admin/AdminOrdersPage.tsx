import React, { useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { useAdminOrders } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useOrderMutations } from '../../hooks/mutations/useOrderMutations';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import type { OrderWithRelations } from '../../lib/database.types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import DataTable from '../../components/admin/ui/DataTable';
import ViewOrderModal from '../../components/admin/ViewOrderModal';
import { Button } from '../../components/ui/Button';

const AdminOrdersPage: React.FC = () => {
    const { data: orders = [], isLoading, error, refetch } = useAdminOrders();
    const { bulkUpdateOrderStatus, bulkDeleteOrders } = useOrderMutations();
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);

    const handleViewDetails = (order: OrderWithRelations) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };
    
    if (isLoading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ViewOrderModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} order={selectedOrder} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة طلبات "إنها لك"</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShoppingBag /> قائمة كل الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable<OrderWithRelations>
                            data={orders}
                            columns={[
                                { accessorKey: 'users.name', header: 'العميل' },
                                { accessorKey: 'child_profiles.name', header: 'الطفل' },
                                { accessorKey: 'item_summary', header: 'الملخص' },
                                { accessorKey: 'total', header: 'الإجمالي' },
                                { accessorKey: 'status', header: 'الحالة' },
                            ]}
                            bulkActions={[
                                {
                                    label: 'تغيير الحالة إلى "قيد التجهيز"',
                                    action: (selected) => bulkUpdateOrderStatus.mutate({ orderIds: selected.map(s => s.id), status: 'قيد التجهيز' }),
                                },
                                {
                                    label: 'تغيير الحالة إلى "تم الشحن"',
                                    action: (selected) => bulkUpdateOrderStatus.mutate({ orderIds: selected.map(s => s.id), status: 'تم الشحن' }),
                                },
                                 {
                                    label: 'حذف المحدد (لا يمكن التراجع)',
                                    action: (selected) => {
                                        if (window.confirm(`هل أنت متأكد من حذف ${selected.length} طلبات؟`)) {
                                            bulkDeleteOrders.mutate({ orderIds: selected.map(s => s.id) });
                                        }
                                    },
                                    isDestructive: true,
                                }
                            ]}
                            renderRowActions={(order) => (
                                <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)} title="عرض التفاصيل">
                                    <Eye size={18} />
                                </Button>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminOrdersPage;