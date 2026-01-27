
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Library, Book, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAdminPersonalizedProducts } from '../../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useProductMutations } from '../../../hooks/mutations/useProductMutations';
import PageLoader from '../../../components/ui/PageLoader';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import ErrorState from '../../../components/ui/ErrorState';
import SortableTableHead from '../../../components/admin/ui/SortableTableHead';
import Image from '../../../components/ui/Image';
import { formatCurrency } from '../../../utils/helpers';
import type { PersonalizedProduct } from '../../../lib/database.types';
import { useAuth } from '../../../contexts/AuthContext';

const StatusBadge: React.FC<{ status: string, isActive: boolean }> = ({ status, isActive }) => {
    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                <Clock size={12} /> قيد المراجعة
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                <XCircle size={12} /> مرفوض
            </span>
        );
    }
    return isActive ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            <CheckCircle size={12} /> منشور
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            مخفي
        </span>
    );
};

const PublisherProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    // Query fetches all visible products (including active ones from others due to public store RLS)
    const { data: allProducts = [], isLoading, error, refetch } = useAdminPersonalizedProducts();
    
    const { deletePersonalizedProduct } = useProductMutations();
    const [sortConfig, setSortConfig] = useState<{ key: keyof PersonalizedProduct; direction: 'asc' | 'desc' } | null>({ key: 'title', direction: 'asc' });

    // Client-side filtering to show ONLY products owned by this publisher in their dashboard
    const myProducts = useMemo(() => {
        if (!currentUser) return [];
        return allProducts.filter(p => p.publisher_id === currentUser.id);
    }, [allProducts, currentUser]);

    const sortedProducts = useMemo(() => {
        let products = [...myProducts];
        if (sortConfig !== null) {
            products.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return products;
    }, [myProducts, sortConfig]);

    const handleSort = (key: keyof PersonalizedProduct) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
            await deletePersonalizedProduct.mutateAsync({ productId });
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل الكتب..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">مكتبتي</h1>
                <Button onClick={() => navigate('/admin/publisher-products/new?type=library_book')} icon={<Plus size={18} />}>
                    إضافة كتاب جديد
                </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 text-sm">
                <strong>ملاحظة:</strong> أي كتاب جديد أو تعديل على كتاب حالي سيخضع لمراجعة الإدارة قبل ظهوره للجمهور.
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Library className="text-blue-500" /> قائمة الكتب المنشورة
                    </CardTitle>
                    <CardDescription>
                        إدارة الكتب الخاصة بدار النشر الخاصة بك.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableTableHead<PersonalizedProduct> sortKey="title" label="الكتاب" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead<PersonalizedProduct> sortKey="price_printed" label="السعر (مطبوع/إلكتروني)" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHead className="text-center">الحالة</TableHead>
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedProducts.length > 0 ? (
                                    sortedProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="flex items-center gap-4 min-w-[250px]">
                                                <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted border">
                                                    <Image src={product.image_url || ''} alt={product.title} className="w-full h-full" objectFit="contain" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold block text-base">{product.title}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{product.key}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {`${product.price_printed ? formatCurrency(product.price_printed) : '-'} / ${product.price_electronic ? formatCurrency(product.price_electronic) : '-'}`}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusBadge status={product.approval_status || 'approved'} isActive={product.is_active || false} />
                                            </TableCell>
                                            <TableCell className="flex items-center gap-1">
                                                <Button onClick={() => navigate(`/admin/publisher-products/${product.id}`)} variant="ghost" size="icon" title="تعديل"><Edit size={20} /></Button>
                                                <Button onClick={() => handleDeleteProduct(product.id)} variant="ghost" size="icon" className="text-destructive" title="حذف"><Trash2 size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Book size={40} className="text-gray-300" />
                                                <p>لم تقم بإضافة أي كتب بعد.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PublisherProductsPage;
