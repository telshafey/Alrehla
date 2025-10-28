import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, UserPlus, ShoppingBag, BookOpen, Star, ArrowLeft } from 'lucide-react';
import type { ChildProfile, Order, CreativeWritingBooking, Subscription } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/helpers';

interface ChildDashboardCardProps {
    child: ChildProfile;
    allUserActivity: {
        orders: Order[];
        bookings: CreativeWritingBooking[];
        subscriptions: Subscription[];
    };
    onEdit: (child: ChildProfile) => void;
    onDelete: (childId: number) => void;
    onCreateStudentAccount: (child: ChildProfile) => void;
}

const ActivityIcon: React.FC<{type: string}> = ({type}) => {
     switch (type) {
        case 'order': return <ShoppingBag size={18} className="text-pink-500"/>;
        case 'booking': return <BookOpen size={18} className="text-purple-500"/>;
        case 'subscription': return <Star size={18} className="text-orange-500"/>;
        default: return null;
    }
}

const ChildDashboardCard: React.FC<ChildDashboardCardProps> = ({ child, allUserActivity, onEdit, onDelete, onCreateStudentAccount }) => {
    
    const childActivity = useMemo(() => {
        const orders = allUserActivity.orders.filter(o => o.child_id === child.id);
        const bookings = allUserActivity.bookings.filter(b => b.child_id === child.id);
        const subscriptions = allUserActivity.subscriptions.filter(s => s.child_id === child.id);
        
        const allItems = [
            ...orders.map(o => ({ type: 'order' as const, date: o.order_date, summary: o.item_summary, id: o.id, link: `/enha-lak/store`})),
            ...bookings.map(b => ({ type: 'booking' as const, date: b.created_at, summary: b.package_name, id: b.id, link: `/journey/${b.id}` })),
            ...subscriptions.map(s => ({ type: 'subscription' as const, date: s.start_date, summary: 'صندوق الرحلة الشهري', id: s.id, link: '/enha-lak/subscription' }))
        ];

        return {
            orders,
            bookings,
            subscriptions,
            recent: allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
        };
    }, [child, allUserActivity]);

    return (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-md border">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4">
                <img 
                    src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                    alt={child.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="flex-grow text-center sm:text-right">
                    <h3 className="text-2xl font-bold text-gray-800">{child.name}</h3>
                    <p className="text-gray-500">{child.age} سنوات</p>
                    {child.student_user_id ? (
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block mt-2">حساب طالب مفعل</span>
                    ) : null}
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    {!child.student_user_id && (
                        <Button variant="outline" size="sm" onClick={() => onCreateStudentAccount(child)} icon={<UserPlus size={16} />}>
                            إنشاء حساب
                        </Button>
                    )}
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(child)} aria-label={`تعديل ${child.name}`}><Edit size={18} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(child.id)} className="text-red-500" aria-label={`حذف ${child.name}`}><Trash2 size={18} /></Button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Stats */}
                <div className="md:col-span-1 space-y-4">
                     <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-pink-100 text-pink-600 rounded-full"><ShoppingBag /></div>
                        <div>
                            <p className="text-xl font-bold">{childActivity.orders.length}</p>
                            <p className="text-xs text-gray-500">قصص "إنها لك"</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full"><BookOpen /></div>
                        <div>
                            <p className="text-xl font-bold">{childActivity.bookings.length}</p>
                            <p className="text-xs text-gray-500">رحلات "بداية الرحلة"</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full"><Star /></div>
                        <div>
                            <p className="text-xl font-bold">{childActivity.subscriptions.length}</p>
                            <p className="text-xs text-gray-500">اشتراكات نشطة</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-700 mb-3">أحدث الأنشطة</h4>
                    <div className="space-y-3">
                         {childActivity.recent.length > 0 ? childActivity.recent.map(item => (
                            <Link to={item.link} key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                                <div className="flex-shrink-0"><ActivityIcon type={item.type}/></div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-gray-800">{item.summary}</p>
                                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
                                <ArrowLeft size={16} className="text-gray-400"/>
                            </Link>
                         )) : <p className="text-sm text-center text-gray-500 py-8">لا توجد أنشطة مسجلة لهذا الطفل بعد.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChildDashboardCard;
