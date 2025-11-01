import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon } from 'lucide-react';
import { useOrderMutations } from '../../hooks/mutations/useOrderMutations';
import type { Order, OrderStatus } from '../../lib/database.types';
import { formatDate, getStatusColor, calculateAge } from '../../utils/helpers';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import DetailRow from '../shared/DetailRow';

type OrderWithRelations = Order & { child_profiles: { name: string } | null; users: { name: string, email: string } | null };

interface ViewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderWithRelations | null;
}

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
    const age = calculateAge(details.childBirthDate);

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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-2">
                    <h3 className="font-bold text-lg border-b pb-2 mb-2">معلومات العميل والطفل</h3>
                    <DetailRow label="العميل" value={order.users?.name} />
                    <DetailRow label="البريد الإلكتروني" value={order.users?.email} />
                    <DetailRow label="الطفل" value={details.childName || order.child_profiles?.name} />
                    <DetailRow label="العمر" value={age !== null ? `${age} سنوات` : 'غير محدد'} />
                    <DetailRow label="الجنس" value={details.childGender} />
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-lg border-b pb-2 mb-2">تفاصيل الطلب</h3>
                    <DetailRow label="التاريخ" value={formatDate(order.order_date)} />
                    <DetailRow label="الملخص" value={order.item_summary} />
                    <DetailRow label="الإجمالي" value={`${order.total} ج.م`} />
                    <DetailRow label="الحالة" value={
                        <Select value={order.status} onChange={handleStatusChange} className={`p-1 border rounded-md text-sm ${getStatusColor(order.status)}`}>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    } />
                     {order.receipt_url && <DetailRow label="الإيصال" value={<a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><LinkIcon size={14}/><span>عرض</span></a>} />}
                </div>
            </div>
            
             <div className="mt-6 space-y-2">
                <h3 className="font-bold text-lg border-b pb-2 mb-2">بيانات التخصيص</h3>
                {!isEmotionStory ? (
                    <>
                        <DetailRow label="وصف الطفل" value={details.childTraits} isTextArea />
                        <DetailRow label="الهدف من القصة" value={details.storyValue} />
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DetailRow label="البيئة المنزلية" value={details.homeEnvironment} isTextArea />
                        <DetailRow label="بيئة الأصدقاء والمدرسة" value={details.friendsAndSchool} isTextArea />
                        <DetailRow label="الوصف الجسدي" value={details.physicalDescription} isTextArea />
                        <DetailRow label="الحيوان الأليف" value={details.petInfo} isTextArea />
                        <DetailRow label="المشاعر المستهدفة" value={emotionMap[details.storyValue] || details.storyValue} />
                        <DetailRow label="الموقف المحفز" value={details.triggerSituation} isTextArea />
                        <DetailRow label="رد فعل الطفل" value={details.childReaction} isTextArea />
                        <DetailRow label="أسلوب التهدئة الحالي" value={details.calmingMethod} isTextArea />
                        <DetailRow label="التحول الإيجابي المطلوب" value={details.positiveBehavior} isTextArea />
                        <DetailRow label="الهواية المفضلة" value={details.favoriteHobby} />
                        <DetailRow label="الكلمة المفضلة" value={details.favoritePhrase} />
                        <DetailRow label="عنصر البحث البصري" value={details.interactiveElementChoice} />
                    </div>
                )}
            </div>
            
            {details.shippingOption === 'gift' && (
                <div className="mt-6 space-y-2">
                    <h3 className="font-bold text-lg border-b pb-2 mb-2">تفاصيل الهدية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DetailRow label="اسم المستلم" value={details.recipientName} />
                        <DetailRow label="هاتف المستلم" value={details.recipientPhone} />
                        <DetailRow label="عنوان المستلم" value={details.recipientAddress} isTextArea />
                        <DetailRow label="بريد المستلم الإلكتروني" value={details.recipientEmail} />
                        <DetailRow label="رسالة الهدية" value={details.giftMessage} isTextArea />
                        <DetailRow label="إرسال بطاقة رقمية" value={details.sendDigitalCard ? 'نعم' : 'لا'} />
                    </div>
                </div>
            )}

            <div className="mt-6">
                <h3 className="font-bold text-lg mb-2">ملاحظات إدارية</h3>
                <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="أضف ملاحظات داخلية هنا..."></Textarea>
                <Button onClick={handleSaveComment} loading={updateOrderComment.isPending} variant="outline" size="sm" icon={<Save size={16}/>} className="mt-2">
                   حفظ الملاحظة
                </Button>
            </div>
        </Modal>
    );
};

export default ViewOrderModal;
