

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Link as LinkIcon } from 'lucide-react';
// FIX: Removed .ts extension from import path
import { useOrderMutations } from '../../hooks/mutations';
import type { Order, OrderStatus } from '../../lib/database.types';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

type OrderWithRelations = Order & { child_profiles: { name: string } | null; users: { name: string, email: string } | null };

interface ViewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderWithRelations | null;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2 border-b">
        <span className="font-semibold text-gray-500">{label}:</span>
        <span className="text-gray-800 mr-2">{value}</span>
    </div>
);

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, onClose, order }) => {
    const { updateOrderStatus, updateOrderComment } = useOrderMutations();
    const [comment, setComment] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });


    useEffect(() => {
        if (order) {
            setComment(order.admin_comment || '');
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleSaveComment = async () => {
        await updateOrderComment.mutateAsync({ orderId: order.id, comment });
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await updateOrderStatus.mutateAsync({ orderId: order.id, newStatus: e.target.value as OrderStatus });
    };

    const details = order.details as any || {};

    const statuses: OrderStatus[] = ["بانتظار الدفع", "بانتظار المراجعة", "قيد التجهيز", "يحتاج مراجعة", "تم الشحن", "تم التسليم", "ملغي"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="order-modal-title" className="text-2xl font-bold text-gray-800">تفاصيل الطلب <span className="font-mono text-lg text-gray-500">{order.id}</span></h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">معلومات العميل والطفل</h3>
                        <DetailRow label="العميل" value={order.users?.name || 'N/A'} />
                        <DetailRow label="البريد الإلكتروني" value={order.users?.email || 'N/A'} />
                        <DetailRow label="الطفل" value={details.childName || order.child_profiles?.name || 'N/A'} />
                        <DetailRow label="العمر" value={details.childAge} />
                        <DetailRow label="الجنس" value={details.childGender} />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">تفاصيل الطلب</h3>
                        <DetailRow label="التاريخ" value={formatDate(order.order_date)} />
                        <DetailRow label="الملخص" value={order.item_summary} />
                        <DetailRow label="الإجمالي" value={`${order.total} ج.م`} />
                        <DetailRow label="الحالة" value={
                            <select value={order.status} onChange={handleStatusChange} className={`p-1 border rounded-md text-sm ${getStatusColor(order.status)}`}>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        } />
                         {order.receipt_url && <DetailRow label="الإيصال" value={<a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><LinkIcon size={14}/><span>عرض</span></a>} />}
                    </div>
                </div>
                
                 <div className="mt-8 space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">بيانات التخصيص</h3>
                    <DetailRow label="وصف الطفل" value={<p className="whitespace-pre-wrap">{details.childTraits || 'لم يحدد'}</p>} />
                    <DetailRow label="الهدف من القصة" value={details.storyValue || 'لم يحدد'} />
                </div>


                <div className="mt-8">
                    <h3 className="font-bold text-lg mb-2">ملاحظات إدارية</h3>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full p-2 border rounded-lg" placeholder="أضف ملاحظات داخلية هنا..."></textarea>
                    <button onClick={handleSaveComment} disabled={updateOrderComment.isPending} className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full hover:bg-blue-200">
                       {updateOrderComment.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>}
                       <span>حفظ الملاحظة</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderModal;