

import React, { useState } from 'react';
import { Gift, Plus, Edit } from 'lucide-react';
import { useAdminPersonalizedProducts } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AdminSection from '../../components/admin/AdminSection.tsx';
import ProductModal from '../../components/admin/ProductModal.tsx';
import type { PersonalizedProduct } from '../../lib/database.types.ts';

const AdminPersonalizedProductsPage: React.FC = () => {
    const { data: personalizedProducts = [], isLoading, error } = useAdminPersonalizedProducts();
    const { createPersonalizedProduct, updatePersonalizedProduct } = useAppMutations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<PersonalizedProduct | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = (product: PersonalizedProduct | null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (payload: any) => {
        setIsSaving(true);
        try {
            if (payload.id) {
                // Correctly call the mutation function using `.mutateAsync`.
                await updatePersonalizedProduct.mutateAsync(payload);
            } else {
                // Correctly call the mutation function using `.mutateAsync`.
                await createPersonalizedProduct.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) {
            // Error handled in hook
        } finally {
            setIsSaving(false);
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
                product={selectedProduct}
                isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المنتجات المخصصة</h1>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                        <Plus size={18} /><span>إضافة منتج</span>
                    </button>
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
                                {personalizedProducts.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 flex items-center gap-4">
                                            <img src={product.image_url || ''} alt={product.title} className="w-12 h-12 object-contain rounded-md bg-gray-100" />
                                            <span className="font-semibold">{product.title}</span>
                                        </td>
                                        <td className="p-3 font-mono text-sm">{product.key}</td>
                                        <td className="p-3">{product.sort_order}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleOpenModal(product)} className="text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminPersonalizedProductsPage;
