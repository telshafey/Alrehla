
import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Check, X } from 'lucide-react';
// FIX: Corrected import path from non-existent queries.ts to adminQueries.ts
import { useAdminCWSettings } from '../../hooks/adminQueries';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import CWSettingsModal from '../../components/admin/CWSettingsModal';
import { Button } from '../../components/ui/Button';
import type { CreativeWritingPackage, AdditionalService } from '../../lib/database.types';

const AdminCreativeWritingSettingsPage: React.FC = () => {
    const { data, isLoading, error } = useAdminCWSettings();
    const { 
        createCreativeWritingPackage, updateCreativeWritingPackage, deleteCreativeWritingPackage,
        createAdditionalService, updateAdditionalService, deleteAdditionalService 
    } = useCreativeWritingSettingsMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'package' | 'service'>('package');
    const [itemToEdit, setItemToEdit] = useState<CreativeWritingPackage | AdditionalService | null>(null);
    const isSaving = createCreativeWritingPackage.isPending || updateCreativeWritingPackage.isPending || createAdditionalService.isPending || updateAdditionalService.isPending;

    const handleOpenModal = (type: 'package' | 'service', item: CreativeWritingPackage | AdditionalService | null) => {
        setModalType(type);
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleSave = async (payload: any) => {
        try {
            if (modalType === 'package') {
                if (payload.id) {
                    await updateCreativeWritingPackage.mutateAsync(payload);
                } else {
                    await createCreativeWritingPackage.mutateAsync(payload);
                }
            } else { // service
                if (payload.id) {
                    await updateAdditionalService.mutateAsync(payload);
                } else {
                    await createAdditionalService.mutateAsync(payload);
                }
            }
            setIsModalOpen(false);
        } catch (e) {
            // Error handled in hook
        }
    };
    
    const handleDelete = async (type: 'package' | 'service', id: number) => {
        if(window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            if (type === 'package') {
                await deleteCreativeWritingPackage.mutateAsync({ id });
            } else {
                await deleteAdditionalService.mutateAsync({ id });
            }
        }
    }

    if (isLoading) return <PageLoader text="جاري تحميل الإعدادات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <>
            <CWSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isSaving={isSaving}
                itemType={modalType}
                itemToEdit={itemToEdit}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إعدادات برنامج "بداية الرحلة"</h1>

                <AdminSection title="باقات البرنامج" icon={<Package />}>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenModal('package', null)} icon={<Plus size={18} />}>
                            إضافة باقة
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead><tr className="border-b-2">
                                <th className="p-3">الباقة</th><th className="p-3">السعر</th><th className="p-3">الجلسات</th><th className="p-3">الأكثر شيوعاً</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {data?.packages.map(pkg => (
                                    <tr key={pkg.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{pkg.name}</td>
                                        <td className="p-3">{pkg.price} ج.م</td>
                                        <td className="p-3">{pkg.sessions}</td>
                                        <td className="p-3">{pkg.popular ? <Check className="text-green-500" /> : <X className="text-red-500"/>}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal('package', pkg)}><Edit size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="hover:text-red-600" onClick={() => handleDelete('package', pkg.id)}><Trash2 size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>

                <AdminSection title="الخدمات الإضافية" icon={<Package />}>
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenModal('service', null)} icon={<Plus size={18} />}>
                            إضافة خدمة
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-right">
                           <thead><tr className="border-b-2">
                                <th className="p-3">الخدمة</th><th className="p-3">الوصف</th><th className="p-3">السعر</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {data?.services.map(srv => (
                                    <tr key={srv.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{srv.name}</td>
                                        <td className="p-3 text-sm text-gray-600">{srv.description}</td>
                                        <td className="p-3">{srv.price} ج.م</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal('service', srv)}><Edit size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="hover:text-red-600" onClick={() => handleDelete('service', srv.id)}><Trash2 size={20} /></Button>
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

export default AdminCreativeWritingSettingsPage;