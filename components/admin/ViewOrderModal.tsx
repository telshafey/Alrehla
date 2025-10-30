import React, { useState, useEffect } from 'react';
import { Save, Loader2, Link as LinkIcon } from 'lucide-react';
import { useOrderMutations } from '../../hooks/mutations/useOrderMutations';
import type { Order, OrderStatus } from '../../lib/database.types';
import { formatDate, getStatusColor } from '../../utils/helpers';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

type OrderWithRelations = Order & { child_profiles: { name: string } | null; users: { name: string, email: string } | null };

interface ViewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderWithRelations | null;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; isTextArea?: boolean }> = ({ label, value, isTextArea = false }) => (
    <div className="py-2 border-b">
        <span className="font-semibold text-gray-500">{label}:</span>
        {isTextArea ? <div className="text-gray-800 mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded">{value || 'N/A'}</div> : <span className="text-gray-800 mr-2">{value || 'N/A'}</span>}
    </div>
);


const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, onClose, order }) => {
    const { updateOrderStatus, updateOrderComment } = useOrderMutations();
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (order) {
            setComment(order.admin_comment || '');
        }
    }, [order]);

    if (!order) return null;

    const handleSaveComment = async () => {
        await updateOrderComment.mutateAsync({ orderId: order.id, comment });
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await updateOrderStatus.mutateAsync({ orderId: order.id, newStatus: e.target.value as OrderStatus });
    };

    const details = order.details as any || {};
    const isEmotionStory = details.productKey === 'emotion_story';

    const statuses: OrderStatus[] = ["بانتظار الدفع", "بانتظار المراجعة", "قيد التجهيز", "يحتاج مراجعة", "قيد التنفيذ", "تم الشحن", "تم التسليم", "مكتمل", "ملغي"];
    
    const emotionMap: { [key: string]: string } = {
        anger: 'الغضب', fear: 'الخوف', jealousy: 'الغيرة',
        frustration: 'الإحباط', anxiety: 'القلق', sadness: 'الحزن',
    };

    return (
        <Modal 
            isOpen={isOpen}
            onClose={onClose}
            title={`تفاصيل الطلب: ${order.id}`}
            size="3xl"
        >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">معلومات العميل والطفل</h3>
                    <DetailRow label="العميل" value={order.users?.name} />
                    <DetailRow label="البريد الإلكتروني" value={order.users?.email} />
                    <DetailRow label="الطفل" value={details.childName || order.child_profiles?.name} />
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
            
             {!isEmotionStory ? (
                <div className="mt-8 space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">بيانات التخصيص</h3>
                    <DetailRow label="وصف الطفل" value={<p className="whitespace-pre-wrap">{details.childTraits || 'لم يحدد'}</p>} />
                    <DetailRow label="الهدف من القصة" value={details.storyValue || 'لم يحدد'} />
                </div>
             ) : (
                <>
                    <div className="mt-8 space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">بيانات السياق</h3>
                        <DetailRow label="البيئة المنزلية" value={details.homeEnvironment} isTextArea />
                        <DetailRow label="بيئة الأصدقاء والمدرسة" value={details.friendsAndSchool} isTextArea />
                        <DetailRow label="الوصف الجسدي" value={details.physicalDescription} isTextArea />
                        <DetailRow label="الحيوان الأليف" value={details.petInfo} isTextArea />
                    </div>
                    <div className="mt-8 space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">رحلة المشاعر</h3>
                        <DetailRow label="المشاعر المستهدفة" value={emotionMap[details.storyValue] || details.storyValue} />
                        <DetailRow label="الموقف المحفز" value={details.triggerSituation} isTextArea />
                        <DetailRow label="رد فعل الطفل" value={details.childReaction} isTextArea />
                        <DetailRow label="أسلوب التهدئة الحالي" value={details.calmingMethod} isTextArea />
                        <DetailRow label="التحول الإيجابي المطلوب" value={details.positiveBehavior} isTextArea />
                    </div>
                     <div className="mt-8 space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">لمسات إبداعية</h3>
                        <DetailRow label="الهواية المفضلة" value={details.favoriteHobby} />
                        <DetailRow label="الكلمة المفضلة" value={details.favoritePhrase} />
                        <DetailRow label="عنصر البحث البصري" value={details.interactiveElementChoice} />
                    </div>
                </>
             )}

            <div className="mt-8">
                <h3 className="font-bold text-lg mb-2">ملاحظات إدارية</h3>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full p-2 border rounded-lg" placeholder="أضف ملاحظات داخلية هنا..."></textarea>
                <Button onClick={handleSaveComment} loading={updateOrderComment.isPending} variant="subtle" size="sm" icon={<Save size={16}/>}>
                   حفظ الملاحظة
                </Button>
            </div>
        </Modal>
    );
};

export default ViewOrderModal;