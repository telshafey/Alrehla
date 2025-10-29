import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Plus, Edit, Trash2, Star, Puzzle, Check, X, Settings } from 'lucide-react';
import { useAdminPersonalizedProducts } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useProductMutations } from '../../hooks/mutations/useProductMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import type { PersonalizedProduct } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';

const AdminPersonalizedProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: personalizedProducts = [], isLoading, error } = useAdminPersonalizedProducts();
    const { deletePersonalizedProduct } = useProductMutations();
    
    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟ هذه العملية لا يمكن التراجع عنها.')) {
            await deletePersonalizedProduct.mutateAsync({ productId });
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل المنتجات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    const sortedProducts = [...personalizedProducts].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));

    return (
        <div className="animate-fadeIn space-y-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المنتجات المخصصة</h1>
                <Button onClick={() => navigate('/admin/personalized-products/new')} icon={<Plus size={18} />}>
                    إضافة منتج
                </Button>
            </div>

            <AdminSection title="قائمة المنتجات" icon={<Gift />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2">
                            <tr>
                                <th className="p-3">المنتج</th>
                                <th className="p-3">الأسعار (مطبوع/إلكتروني)</th>
                                <th className="p-3">الترتيب</th>
                                <th className="p-3 text-center"><Star size={16} className="mx-auto" /></th>
                                <th className="p-3 text-center"><Puzzle size={16} className="mx-auto" /></th>
                                <th className="p-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.length > 0 ? (
                                sortedProducts.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 flex items-center gap-4">
                                            <img src={product.image_url || 'https://i.ibb.co/C0bSJJT/favicon.png'} alt={product.title} className="w-12 h-12 object-contain rounded-md bg-gray-100" />
                                            <span className="font-semibold">{product.title}</span>
                                        </td>
                                        <td className="p-3 font-mono text-sm">
                                            {product.key === 'subscription_box' ? (
                                                <span className="font-sans font-semibold text-blue-600">باقات متعددة</span>
                                            ) : (
                                                `${product.price_printed ?? '-'} / ${product.price_electronic ?? '-'}`
                                            )}
                                        </td>
                                        <td className="p-3">{product.sort_order}</td>
                                        <td className="p-3 text-center">{product.is_featured ? <Check className="text-green-500 mx-auto" /> : <X className="text-red-500 mx-auto" />}</td>
                                        <td className="p-3 text-center">{product.is_addon ? <Check className="text-green-500 mx-auto" /> : <X className="text-red-500 mx-auto" />}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            {product.key === 'subscription_box' ? (
                                                <>
                                                    <Button onClick={() => navigate(`/admin/subscription-box`)} variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600" title="إدارة الصندوق"><Settings size={20} /></Button>
                                                    <Button disabled variant="ghost" size="icon" className="text-gray-300 cursor-not-allowed" title="لا يمكن حذف المنتج الأساسي"><Trash2 size={20} /></Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button onClick={() => navigate(`/admin/personalized-products/${product.id}`)} variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600" title="تعديل"><Edit size={20} /></Button>
                                                    <Button onClick={() => handleDeleteProduct(product.id)} variant="ghost" size="icon" className="text-gray-500 hover:text-red-600" title="حذف"><Trash2 size={20} /></Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        لا توجد منتجات بعد. ابدأ بإضافة منتجك الأول!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        </div>
    );
};

export default AdminPersonalizedProductsPage;