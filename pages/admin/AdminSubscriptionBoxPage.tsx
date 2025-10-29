import React, { useState, useEffect } from 'react';
import { Star, FileText, Package, Plus, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import { useAdminSubscriptionPlans } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useSubscriptionMutations } from '../../hooks/mutations/useSubscriptionMutations';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { SubscriptionPlanModal } from '../../components/admin/SubscriptionPlanModal';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import type { SubscriptionPlan, SiteContent } from '../../lib/database.types';

const AdminSubscriptionBoxPage: React.FC = () => {
    // Queries
    const { data: plans = [], isLoading: plansLoading, error: plansError } = useAdminSubscriptionPlans();
    const { data: siteContentData, isLoading: contentLoading, error: contentError } = useAdminSiteContent();
    
    // Mutations
    const { createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } = useSubscriptionMutations();
    const { updateSiteContent } = useContentMutations();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
    const [content, setContent] = useState<SiteContent['enhaLakPage']['subscription'] | null>(null);

    const isLoading = plansLoading || contentLoading;
    const isSavingPlans = createSubscriptionPlan.isPending || updateSubscriptionPlan.isPending;

    useEffect(() => {
        if (siteContentData) {
            setContent(JSON.parse(JSON.stringify(siteContentData.enhaLakPage.subscription)));
        }
    }, [siteContentData]);

    const handleOpenModal = (plan: SubscriptionPlan | null) => {
        setPlanToEdit(plan);
        setIsModalOpen(true);
    };

    const handleSavePlan = async (payload: any) => {
        try {
            if (payload.id) {
                await updateSubscriptionPlan.mutateAsync(payload);
            } else {
                await createSubscriptionPlan.mutateAsync(payload);
            }
            setIsModalOpen(false);
        } catch (e) { /* Error handled in hook */ }
    };
    
    const handleDeletePlan = async (planId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
            await deleteSubscriptionPlan.mutateAsync({ planId });
        }
    };
    
    const handleContentChange = (field: keyof SiteContent['enhaLakPage']['subscription'], value: string | string[]) => {
        setContent(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleContentSave = async () => {
        if (siteContentData && content) {
            const newSiteContent = JSON.parse(JSON.stringify(siteContentData));
            newSiteContent.enhaLakPage.subscription = content;
            await updateSiteContent.mutateAsync(newSiteContent);
        }
    };

    if (isLoading || !content) return <PageLoader />;
    const error = plansError || contentError;
    if (error) return <p className="text-red-500">{error.message}</p>;

    return (
        <>
            <SubscriptionPlanModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePlan}
                isSaving={isSavingPlans}
                planToEdit={planToEdit}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة صندوق الرحلة الشهري</h1>

                <AdminSection title="محتوى صفحة الاشتراك" icon={<FileText />}>
                    <div className="space-y-4">
                        <FormField label="العنوان الرئيسي" htmlFor="heroTitle">
                            <Input id="heroTitle" value={content.heroTitle} onChange={e => handleContentChange('heroTitle', e.target.value)} />
                        </FormField>
                        <FormField label="النص التعريفي" htmlFor="heroSubtitle">
                            <Textarea id="heroSubtitle" value={content.heroSubtitle} onChange={e => handleContentChange('heroSubtitle', e.target.value)} rows={3}/>
                        </FormField>
                        <FormField label="ميزات الصندوق (كل ميزة في سطر)" htmlFor="features">
                            <Textarea id="features" value={(content.features || []).join('\n')} onChange={e => handleContentChange('features', e.target.value.split('\n'))} rows={4}/>
                        </FormField>
                        <div className="flex justify-end">
                            <Button onClick={handleContentSave} loading={updateSiteContent.isPending} icon={<Save />}>حفظ المحتوى</Button>
                        </div>
                    </div>
                </AdminSection>

                <AdminSection title="باقات الاشتراك" icon={<Package />}>
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                            إضافة باقة
                        </Button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">الباقة</th><th className="p-3">المدة</th><th className="p-3">السعر الإجمالي</th><th className="p-3">السعر الشهري</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {plans.map((plan: SubscriptionPlan) => (
                                    <tr key={plan.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{plan.name} {plan.is_best_value && <span className="text-xs text-yellow-600">(الأفضل قيمة)</span>}</td>
                                        <td className="p-3">{plan.duration_months} أشهر</td>
                                        <td className="p-3 font-bold">{plan.price} ج.م</td>
                                        <td className="p-3">{plan.price_per_month} ج.م</td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(plan)}><Edit size={20} /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={20} /></Button>
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

export default AdminSubscriptionBoxPage;