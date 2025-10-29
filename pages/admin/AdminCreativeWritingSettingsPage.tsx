import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, Package } from 'lucide-react';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useCreativeWritingSettingsMutations } from '../../hooks/mutations/useCreativeWritingSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import CWSettingsModal from '../../components/admin/CWSettingsModal';
import { Button } from '../../components/ui/Button';
import type { CreativeWritingPackage, AdditionalService } from '../../lib/database.types';

const AdminCreativeWritingSettingsPage: React.FC = () => {
    const { data, isLoading, error } = useAdminCWSettings();
    const { 
        createCreativeWritingPackage, 
        updateCreativeWritingPackage, 
        deleteCreativeWritingPackage,
        createAdditionalService,
        updateAdditionalService,
        deleteAdditionalService
    } = useCreativeWritingSettingsMutations();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalItemType, setModalItemType] = useState<'package' | 'service'>('package');
    const [itemToEdit, setItemToEdit] = useState<CreativeWritingPackage | AdditionalService | null>(null);

    const isSaving = createCreativeWritingPackage.isPending || updateCreativeWritingPackage.isPending || createAdditionalService.isPending || updateAdditionalService.isPending;

    const handleOpenModal = (itemType: 'package' | 'service', item: CreativeWritingPackage | AdditionalService | null) => {
        setModalItemType(itemType);
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleSave = async (payload: any) => {
        try {
            if (modalItemType === 'package') {
                if (payload.id) {
                    await updateCreativeWritingPackage.mutateAsync(payload);
                } else {
                    await createCreativeWritingPackage.mutateAsync(payload);
                }
            } else {
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
    
    const handleDeletePackage = async (packageId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
            await deleteCreativeWritingPackage.mutateAsync({ packageId });
        }
    };
    
    const handleDeleteService = async (serviceId: number) => {
         if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            await deleteAdditionalService.mutateAsync({ serviceId });
        }
    };


    if (isLoading) return <PageLoader text="جاري تحميل الإعدادات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    const { packages = [], services = [] } = data || {};

    return (
        <>
            <CWSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isSaving={isSaving}
                itemType={modalItemType}
                itemToEdit={itemToEdit}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إعدادات "بداية الرحلة"</h1>
                
                <AdminSection title="إدارة الباقات" icon={<Package />}>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenModal('package', null)} icon={<Plus size={18} />}>
                            إضافة باقة
                        </Button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">الباقة</th><th className="p-3">الجلسات</th><th className="p-3">السعر</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {packages.map((pkg: CreativeWritingPackage) => (
                                    <tr key={pkg.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{pkg.name} {pkg.popular && <span className="text-xs text-blue-600">(الأكثر شيوعاً)</span>}</td>
                                        <td className="p-3">{pkg.sessions}</td>
                                        <td className="p-3 font-bold">{pkg.price} ج.م</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal('package', pkg)}><Edit size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeletePackage(pkg.id)}><Trash2 size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>

                <AdminSection title="الخدمات الإضافية" icon={<Settings />}>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenModal('service', null)} icon={<Plus size={18} />}>
                            إضافة خدمة
                        </Button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">الخدمة</th><th className="p-3">السعر</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {services.map((service: AdditionalService) => (
                                    <tr key={service.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{service.name}</td>
                                        <td className="p-3 font-bold">{service.price} ج.م</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal('service', service)}><Edit size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteService(service.id)}><Trash2 size={20} /></Button>
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