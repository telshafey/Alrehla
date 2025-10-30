import React, { useState, useEffect } from 'react';
import { Star, FileText, Package, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useAdminSubscriptionPlans } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useSubscriptionMutations } from '../../hooks/mutations/useSubscriptionMutations';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { SubscriptionPlanModal } from '../../components/admin/SubscriptionPlanModal';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import type { SubscriptionPlan, SiteContent } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const AdminSubscriptionBoxPage: React.FC = () => {
    // Queries
    const { data: plans = [], isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useAdminSubscriptionPlans();
    const { data: siteContentData, isLoading: contentLoading, error: contentError, refetch: refetchContent } = useAdminSiteContent();
    
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

    const error = plansError || contentError;
    const refetch = () => {
        if(plansError) refetchPlans();
        if(contentError) refetchContent();
    }

    if (isLoading || !content) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <SubscriptionPlanModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePlan}
                isSaving={isSavingPlans}
                planToEdit={planToEdit}
            />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة صندوق الرحلة الشهري</h1>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText /> محتوى صفحة الاشتراك
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                             <span className="flex items-center gap-2"><Package /> باقات الاشتراك</span>
                            <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />} size="sm">
                                إضافة باقة
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="overflow-x-auto">
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                        <TableHead>الباقة</TableHead>
                                        <TableHead>المدة</TableHead>
                                        <TableHead>السعر الإجمالي</TableHead>
                                        <TableHead>السعر الشهري</TableHead>
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.map((plan: SubscriptionPlan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell className="font-semibold">{plan.name} {plan.is_best_value && <span className="text-xs text-primary">(الأفضل قيمة)</span>}</TableCell>
                                            <TableCell>{plan.duration_months} أشهر</TableCell>
                                            <TableCell className="font-bold">{plan.price} ج.م</TableCell>
                                            <TableCell>{plan.price_per_month} ج.م</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(plan)}><Edit size={20} /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminSubscriptionBoxPage;