
import React, { useState, useMemo } from 'react';
import { ShoppingBag, Eye, Search, RefreshCw } from 'lucide-react';
import { useAdminOrders } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useOrderMutations } from '../../hooks/mutations/useOrderMutations';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import type { OrderWithRelations } from '../../lib/database.types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import { ORDER_STATUSES } from '../../lib/constants';

const AdminOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders = [], isLoading, error, refetch, isRefetching } = useAdminOrders();
    const { bulkUpdateOrderStatus, bulkDeleteOrders } = useOrderMutations();

    // Sort, Filter, Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'order_date', direction: 'desc' });

    const filteredAndSortedOrders = useMemo(() => {
        let data = [...orders];

        // 1. Filter by Status
        if (statusFilter !== 'all') {
            data = data.filter(order => order.status === statusFilter);
        }

        // 2. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(order => 
                order.item_summary?.toLowerCase().includes(lowerTerm) ||
                order.users?.name?.toLowerCase().includes(lowerTerm) ||
                order.child_profiles?.name?.toLowerCase().includes(lowerTerm) ||
                order.id?.toLowerCase().includes(lowerTerm)
            );
        }

        // 3. Sort
        if (sortConfig) {
            data.sort((a, b) => {
                // Helper to get value safely for nested props
                const getValue = (item: OrderWithRelations, key: string) => {
                    if (key === 'users.name') return item.users?.name || '';
                    if (key === 'child_profiles.name') return item.child_profiles?.name || '';
                    return (item as any)[key];
                };

                const aVal = getValue(a, sortConfig.key);
                const bVal = getValue(b, sortConfig.key);

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [orders, searchTerm, statusFilter, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    if (isLoading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة طلبات "إنها لك"</h1>
                <Button onClick={() => refetch()} variant="outline" size="sm" icon={<RefreshCw className={isRefetching ? "animate-spin" : ""} size={16} />}>
                    تحديث البيانات
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingBag /> قائمة كل الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input 
                                placeholder="بحث برقم الطلب، العميل، الطفل، أو المنتج..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">كل الحالات</option>
                                {ORDER_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableTableHead<OrderWithRelations> sortKey="users.name" label="العميل" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<OrderWithRelations> sortKey="child_profiles.name" label="الطفل" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<OrderWithRelations> sortKey="item_summary" label="الملخص" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<OrderWithRelations> sortKey="total" label="الإجمالي" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<OrderWithRelations> sortKey="status" label="الحالة" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedOrders.length > 0 ? (
                                    filteredAndSortedOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.users?.name || <span className="text-muted-foreground text-xs italic">غير معروف (ID: {order.user_id.slice(0,4)})</span>}
                                            </TableCell>
                                            <TableCell>
                                                {order.child_profiles?.name || <span className="text-muted-foreground text-xs italic">غير محدد (ID: {order.child_id})</span>}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate" title={order.item_summary}>{order.item_summary}</TableCell>
                                            <TableCell className="font-bold">{order.total} ج.م</TableCell>
                                            <TableCell>
                                                <StatusBadge status={order.status} showIcon />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/orders/${order.id}`)} title="عرض ومراجعة">
                                                    <Eye size={18} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {orders.length === 0 ? "لا توجد طلبات في قاعدة البيانات." : "لا توجد طلبات تطابق بحثك."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        إجمالي النتائج: {filteredAndSortedOrders.length} طلب
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOrdersPage;
