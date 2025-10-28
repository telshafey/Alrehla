import React, { useState } from 'react';
import { Gift, Plus, Edit, Trash2 } from 'lucide-react';
// FIX: Corrected import paths
import { useAdminPersonalizedProducts } from '../../hooks/adminQueries';
import { useProductMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import ProductModal from '../../components/admin/ProductModal';
import type { PersonalizedProduct } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';

const AdminPersonalizedProductsPage: React.FC = () => {
    const { data: personalizedProducts = [], isLoading, error } = useAdminPersonalizedProducts();
    const { createPersonalizedProduct, updatePersonalizedProduct, deletePersonalizedProduct } = useProductMutations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<PersonalizedProduct | null>(null);
    
    const isSaving = createPersonalizedProduct.isPending || updatePersonalizedProduct.isPending;

    const handleOpenModal = (product: PersonalizedProduct | null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (payload: any) => {
        try {
            if (payload.id) {
                await updatePersonalizedProduct.mutateAsync(payload);
            } else {
                await createPersonalizedProduct.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) {
            // Error handled in hook
        }
    };
    
    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟ هذه العملية لا يمكن التراجع عنها.')) {
            await deletePersonalizedProduct.mutateAsync({ productId });
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل المنتجات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <>
            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                productToEdit={selectedProduct}
                isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المنتجات المخصصة</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        إضافة منتج
                    </Button>
                </div>

                <AdminSection title="قائمة المنتجات" icon={<Gift />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">المنتج</th>
                                    <th className="p-3">المعرّف (Key)</th>
                                    <th className="p-3">الترتيب</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personalizedProducts.length > 0 ? (
                                    personalizedProducts.map(product => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 flex items-center gap-4">
                                                <img src={product.image_url || 'https://i.ibb.co/C0bSJJT/favicon.png'} alt={product.title} className="w-12 h-12 object-contain rounded-md bg-gray-100" />
                                                <span className="font-semibold">{product.title}</span>
                                            </td>
                                            <td className="p-3 font-mono text-sm">{product.key}</td>
                                            <td className="p-3">{product.sort_order}</td>
                                            <td className="p-3 flex items-center gap-2">
                                                <Button onClick={() => handleOpenModal(product)} variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600" title="تعديل"><Edit size={20} /></Button>
                                                <Button onClick={() => handleDeleteProduct(product.id)} variant="ghost" size="icon" className="text-gray-500 hover:text-red-600" title="حذف"><Trash2 size={20} /></Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-gray-500">
                                            لا توجد منتجات بعد. ابدأ بإضافة منتجك الأول!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminPersonalizedProductsPage;