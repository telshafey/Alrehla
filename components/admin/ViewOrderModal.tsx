import React, { useState } from 'react';
import { X, User, Package, Calendar, Edit, Save, Loader2, Truck, Gift } from 'lucide-react';
import { Order, OrderDetailsJson } from '../../lib/database.types.ts';
import { formatDate, getStatusColor } from '../../utils/helpers.ts';
import { useAppMutations } from '../../hooks/mutations.ts';

export interface IOrderDetails extends Order {
    child_profiles: { name: string } | null;
    users: { name: string, email: string } | null;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrderDetails | null;
}

const DetailItem: React.FC<{ label: string, value?: string | number | null }> = ({ label, value }) => (
    value ? <div><span className="font-semibold text-gray-500">{label}:</span> {value}</div> : null
);

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, onClose, order }) => {
    const { updateOrderComment } = useAppMutations();
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    React.useEffect(() => {
        if(order) {
            setComment(order.admin_comment || '');
        }
    }, [order]);

    if (!isOpen || !order) return null;
    
    const details = order.details as OrderDetailsJson | null;

    const handleSaveComment = async () => {
        setIsSaving(true);
        try {
            // Correctly call the mutation function using `.mutateAsync`.
            await updateOrderComment.mutateAsync({ orderId: order.id, comment });
            onClose();
        } catch(e) {
            // Error handled by hook
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-12" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">تفاصيل الطلب <span className="font-mono text-lg">{order.id}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><User /> العميل</h3>
                            <p>{order.customer_name}</p>
                            <p className="text-sm text-gray-500">{order.users?.email}</p>
                        </div>
                         <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><Calendar /> معلومات الطلب</h3>
                            <p>تاريخ الطلب: {formatDate(order.order_date)}</p>
                            <p>الإجمالي: {order.total} ج.م</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                         <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><Package /> تفاصيل التخصيص</h3>
                         <div className="p-4 border rounded-lg space-y-2 text-sm">
                            <DetailItem label="المنتج" value={order.item_summary} />
                            <DetailItem label="اسم الطفل" value={details?.childName} />
                            <DetailItem label="عمر الطفل" value={details?.childAge} />
                            <DetailItem label="جنس الطفل" value={details?.childGender} />
                            <DetailItem label="وصف الشخصية" value={details?.childTraits} />
                            <DetailItem label="أسماء العائلة" value={details?.familyNames} />
                            <DetailItem label="أسماء الأصدقاء" value={details?.friendNames} />
                            <DetailItem label="الهدف من القصة" value={details?.storyValue} />
                            <DetailItem label="الهدف المخصص" value={details?.customGoal} />
                         </div>
                    </div>

                     <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                            {details?.shippingOption === 'gift' ? <Gift /> : <Truck />}
                            تفاصيل التوصيل
                        </h3>
                         <div className="p-4 border rounded-lg space-y-2 text-sm">
                            <DetailItem label="نوع النسخة" value={details?.deliveryType === 'printed' ? 'مطبوع' : 'إلكتروني'} />
                            {details?.shippingOption === 'gift' && details.giftDetails ? (
                                <>
                                    <p className="font-bold pt-2 border-t mt-2">مرسل كهدية إلى:</p>
                                    <DetailItem label="اسم المستلم" value={details.giftDetails.name} />
                                    <DetailItem label="عنوان المستلم" value={details.giftDetails.address} />
                                    <DetailItem label="هاتف المستلم" value={details.giftDetails.phone} />
                                    <DetailItem label="المحافظة" value={details.governorate} />
                                </>
                            ) : (
                                <>
                                    <p className="font-bold pt-2 border-t mt-2">توصيل لعنوان المستخدم:</p>
                                    <DetailItem label="المحافظة" value={details?.governorate} />
                                </>
                            )}
                         </div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><Edit /> ملاحظات إدارية</h3>
                         <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3} 
                            className="w-full p-2 border rounded-lg"
                            placeholder="أضف ملاحظات داخلية هنا..."
                        />
                         <button onClick={handleSaveComment} disabled={isSaving} className="mt-2 flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-200 disabled:bg-gray-200">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16}/>}
                           {isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-8 border-t">
                    <button onClick={onClose} className="px-8 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderModal;
