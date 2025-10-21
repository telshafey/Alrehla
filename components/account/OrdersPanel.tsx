
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckSquare, Star, Frown, User } from 'lucide-react';
import { getStatusColor, formatDate } from '../../utils/helpers.ts';

interface UnifiedItem {
    id: string;
    type: 'order' | 'booking' | 'subscription';
    date: string;
    summary: string | null;
    total: string | number | null;
    status: "بانتظار الدفع" | "بانتظار المراجعة" | "قيد التجهيز" | "يحتاج مراجعة" | "تم الشحن" | "تم التسليم" | "ملغي" | "مؤكد" | "مكتمل";
    // FIX: Changed details type from `string | null` to `any` to match order details JSON structure.
    details: any;
    child_id?: number;
    child_name?: string;
}

interface OrdersPanelProps {
    unifiedItems: UnifiedItem[];
    onPay: (item: { id: string, type: 'order' | 'booking' | 'subscription', total: string | number | null, summary: string | null }) => void;
}

const ItemCard: React.FC<{item: UnifiedItem, onPay: OrdersPanelProps['onPay']}> = ({ item, onPay }) => (
     <div className="p-3 bg-white rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex-grow">
            <div className="flex items-center gap-2">
                {item.type === 'order' ? <ShoppingBag size={16} className="text-blue-500"/> : <CheckSquare size={16} className="text-purple-500"/>}
                <p className="font-bold text-gray-800">
                    {item.summary}
                </p>
            </div>
            <p className="text-xs text-gray-500 mt-1 ms-8">{formatDate(item.date)}</p>
        </div>
        <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
             <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
             {item.status === 'بانتظار الدفع' && (
                <button onClick={() => onPay({ id: item.id, type: item.type, total: item.total, summary: item.summary })} className="text-xs text-blue-600 font-bold hover:underline">
                    إتمام الدفع
                </button>
            )}
        </div>
    </div>
);


const OrdersPanel: React.FC<OrdersPanelProps> = ({ unifiedItems, onPay }) => {

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold mb-4">كل الطلبات والحجوزات</h2>
            {unifiedItems.length > 0 ? (
                <div className="space-y-3">
                    {unifiedItems.map(item => <ItemCard key={`${item.type}-${item.id}`} item={item} onPay={onPay} />)}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Frown className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">لا يوجد شيء هنا بعد</h3>
                    <p className="mt-1 text-gray-500">لم تقم بأي طلبات أو حجوزات حتى الآن.</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Link to="/enha-lak/store" className="px-5 py-2 border border-blue-600 text-base font-medium rounded-full text-blue-600 bg-white hover:bg-blue-50">
                            تصفح متجر "إنها لك"
                        </Link>
                         <Link to="/creative-writing/booking" className="px-5 py-2 border border-purple-600 text-base font-medium rounded-full text-purple-600 bg-white hover:bg-purple-50">
                            احجز جلسة "بداية الرحلة"
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPanel;
