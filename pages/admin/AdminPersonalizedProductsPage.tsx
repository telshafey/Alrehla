import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Plus, Edit, Trash2, Star, Puzzle, Check, X, Settings } from 'lucide-react';
import { useAdminPersonalizedProducts } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useProductMutations } from '../../hooks/mutations/useProductMutations';
import PageLoader from '../../components/ui/PageLoader';
import type { PersonalizedProduct } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import ErrorState from '../../components/ui/ErrorState';

const AdminPersonalizedProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: personalizedProducts = [], isLoading, error, refetch } = useAdminPersonalizedProducts();
    const { deletePersonalizedProduct } = useProductMutations();
    
    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟ هذه العملية لا يمكن التراجع عنها.')) {
            await deletePersonalizedProduct.mutateAsync({ productId });
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل المنتجات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    const sortedProducts = [...personalizedProducts].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة المنتجات المخصصة</h1>
                <Button onClick={() => navigate('/admin/personalized-products/new')} icon={<Plus size={18} />}>
                    إضافة منتج
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gift /> قائمة المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المنتج</TableHead>
                                    <TableHead>الأسعار (مطبوع/إلكتروني)</TableHead>
                                    <TableHead>الترتيب</TableHead>
                                    <TableHead className="text-center"><Star size={16} className="mx-auto" /></TableHead>
                                    <TableHead className="text-center"><Puzzle size={16} className="mx-auto" /></TableHead>
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedProducts.length > 0 ? (
                                    sortedProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="flex items-center gap-4">
                                                <img src={product.image_url || 'https://i.ibb.co/C0bSJJT/favicon.png'} alt={product.title} className="w-12 h-12 object-contain rounded-md bg-muted" loading="lazy" />
                                                <span className="font-semibold">{product.title}</span>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {product.key === 'subscription_box' ? (
                                                    <span className="font-sans font-semibold text-primary">باقات متعددة</span>
                                                ) : (
                                                    `${product.price_printed ?? '-'} / ${product.price_electronic ?? '-'}`
                                                )}
                                            </TableCell>
                                            <TableCell>{product.sort_order}</TableCell>
                                            <TableCell className="text-center">{product.is_featured ? <Check className="text-green-500 mx-auto" /> : <X className="text-destructive mx-auto" />}</TableCell>
                                            <TableCell className="text-center">{product.is_addon ? <Check className="text-green-500 mx-auto" /> : <X className="text-destructive mx-auto" />}</TableCell>
                                            <TableCell className="flex items-center gap-1">
                                                {product.key === 'subscription_box' ? (
                                                    <>
                                                        <Button onClick={() => navigate(`/admin/subscription-box`)} variant="ghost" size="icon" title="إدارة الصندوق"><Settings size={20} /></Button>
                                                        <Button disabled variant="ghost" size="icon" className="cursor-not-allowed" title="لا يمكن حذف المنتج الأساسي"><Trash2 size={20} /></Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button onClick={() => navigate(`/admin/personalized-products/${product.id}`)} variant="ghost" size="icon" title="تعديل"><Edit size={20} /></Button>
                                                        <Button onClick={() => handleDeleteProduct(product.id)} variant="ghost" size="icon" className="text-destructive" title="حذف"><Trash2 size={20} /></Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            لا توجد منتجات بعد. ابدأ بإضافة منتجك الأول!
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

export default AdminPersonalizedProductsPage;