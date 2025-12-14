
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminServiceOrders } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useOrderMutations } from '../../hooks/mutations/useOrderMutations';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save, Link as LinkIcon, Sparkles } from 'lucide-react';
import DetailRow from '../../components/shared/DetailRow';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { OrderStatus } from '../../lib/database.types';

const orderStatuses: OrderStatus[] = ["بانتظار المراجعة", "قيد التنفيذ", "مكتمل", "ملغي"];

const AdminServiceOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: orders = [], isLoading: ordersLoading } = useAdminServiceOrders();
    const { data: instructors = [], isLoading: instructorsLoading } = useAdminInstructors();
    const { updateServiceOrderStatus, assignInstructorToServiceOrder } = useOrderMutations();

    const [status, setStatus] = useState<OrderStatus>('بانتظار المراجعة');
    const [assignedInstructorId, setAssignedInstructorId] = useState<string>('');

    const order = orders.find(o => o.id === id);

    useEffect(() => {
        if (order) {
            setStatus(order.status);
            setAssignedInstructorId(order.assigned_instructor_id?.toString() || '');
        }
    }, [order]);

    if (ordersLoading) return <PageLoader text="جاري تحميل تفاصيل الطلب..." />;

    if (!order) {
        return <ErrorState message="لم يتم العثور على طلب الخدمة." onRetry={() => navigate('/admin/service-orders')} />;
    }

    const handleSave = async () => {
        const promises = [];
        if (status !== order.status) {
            promises.push(updateServiceOrderStatus.mutateAsync({ orderId: order.id, newStatus: status }));
        }
        const newInstrId = assignedInstructorId ? parseInt(assignedInstructorId) : null;
        if (newInstrId !== order.assigned_instructor_id) {
            promises.push(assignInstructorToServiceOrder.mutateAsync({ orderId: order.id, instructorId: newInstrId }));
        }
        await Promise.all(promises);
    };

    const details = order.details as any || {};

    return (
        <div className="animate-fadeIn space-y-8 max-w-4xl mx-auto pb-20">
            <Link to="/admin/service-orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة لقائمة الطلبات
            </Link>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    <Sparkles /> تفاصيل خدمة: <span className="text-primary">{order.standalone_services?.name}</span>
                </h1>
                <Button onClick={handleSave} loading={updateServiceOrderStatus.isPending || assignInstructorToServiceOrder.isPending} icon={<Save size={18} />}>
                    حفظ التغييرات
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>معلومات العميل والطفل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailRow label="العميل" value={order.users?.name} />
                        <DetailRow label="البريد الإلكتروني" value={order.users?.email} />
                        <DetailRow label="الطفل" value={order.child_profiles?.name} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>تفاصيل الطلب الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailRow label="رقم الطلب" value={order.id} />
                        <DetailRow label="التاريخ" value={formatDate(order.created_at)} />
                        <DetailRow label="الإجمالي" value={`${order.total} ج.م`} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>محتوى الطلب والمرفقات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {details.fileUrl && (
                        <div className="p-4 border rounded-lg flex items-center justify-between bg-muted/20">
                            <span className="font-semibold text-gray-700">الملف المرفق من العميل:</span>
                            <a href={details.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline font-bold">
                                <LinkIcon size={16}/> عرض / تحميل
                            </a>
                        </div>
                    )}
                    {details.userNotes && <DetailRow label="ملاحظات العميل" value={details.userNotes} isTextArea />}
                </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle>الإجراءات الإدارية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">حالة الطلب</label>
                            <Select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value as OrderStatus)} 
                                className={`p-2 h-10 border rounded-md font-bold ${getStatusColor(status)}`}
                            >
                                {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">تعيين مدرب مسؤول</label>
                            <Select 
                                value={assignedInstructorId} 
                                onChange={(e) => setAssignedInstructorId(e.target.value)}
                                disabled={instructorsLoading}
                            >
                                <option value="">-- غير معين --</option>
                                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminServiceOrderDetailPage;
