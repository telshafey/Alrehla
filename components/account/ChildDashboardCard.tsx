
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit, UserPlus, ShoppingBag, BookOpen, Star, ArrowLeft, Award, Lock, Mail, Key } from 'lucide-react';
import type { Order, CreativeWritingBooking, Subscription, Badge, ChildBadge } from '../../lib/database.types';
import type { EnrichedChildProfile } from '../../hooks/queries/user/useUserDataQuery';
import { Button } from '../ui/Button';
import { formatDate, calculateAge } from '../../utils/helpers';
import BadgeDisplay from '../shared/BadgeDisplay';
import Image from '../ui/Image';

interface ChildDashboardCardProps {
    child: EnrichedChildProfile;
    childActivity: {
        orders: Order[];
        bookings: CreativeWritingBooking[];
        subscriptions: Subscription[];
    };
    allBadges: Badge[];
    childBadges: ChildBadge[];
    onEdit: (child: EnrichedChildProfile) => void;
    onDelete: (childId: number) => void; // Kept in prop type for compatibility but not used in UI
    onCreateStudentAccount: (child: EnrichedChildProfile) => void;
    onResetPassword: (child: EnrichedChildProfile) => void;
}

const ActivityIcon: React.FC<{type: string}> = ({type}) => {
     switch (type) {
        case 'order': return <ShoppingBag size={18} className="text-pink-500"/>;
        case 'booking': return <BookOpen size={18} className="text-purple-500"/>;
        case 'subscription': return <Star size={18} className="text-orange-500"/>;
        default: return null;
    }
}

const ChildDashboardCard: React.FC<ChildDashboardCardProps> = ({ child, childActivity, allBadges, childBadges, onEdit, onCreateStudentAccount, onResetPassword }) => {
    
    const recentActivity = useMemo(() => {
        const { orders, bookings, subscriptions } = childActivity;
        const allItems = [
            ...orders.map(o => ({ type: 'order' as const, date: o.order_date, summary: o.item_summary, id: o.id, link: `/account`})),
            ...bookings.map(b => ({ type: 'booking' as const, date: b.created_at, summary: b.package_name, id: b.id, link: `/journey/${b.id}` })),
            ...subscriptions.map(s => ({ type: 'subscription' as const, date: s.start_date, summary: 'صندوق الرحلة الشهري', id: s.id, link: '/account' }))
        ];
        return allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    }, [childActivity]);

    const earnedBadges = useMemo(() => {
        const earned = childBadges
            .filter(cb => cb.child_id === child.id)
            .sort((a,b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());

        return earned.map(cb => allBadges.find(b => b.id === cb.badge_id)).filter(b => b !== undefined) as Badge[];
    }, [child, childBadges, allBadges]);
    
    const age = calculateAge(child.birth_date);

    return (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-md border animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start gap-4 border-b pb-4">
                <Image 
                    src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                    alt={child.name} 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md flex-shrink-0"
                />
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{child.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">{age !== null ? `${age} سنوات` : 'غير محدد'}</p>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(child)} aria-label={`تعديل ${child.name}`}><Edit size={18} /></Button>
                            {/* Delete button removed as requested */}
                        </div>
                    </div>
                    
                    {/* Student Account Status / Credentials */}
                    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        {child.student_user_id ? (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs font-bold text-green-700">حساب طالب نشط</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => onResetPassword(child)} className="h-7 text-xs px-2" icon={<Key size={12} />}>
                                        تغيير كلمة المرور
                                    </Button>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400"/>
                                        <span className="font-mono text-xs">{child.student_email || 'البريد غير متاح'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Lock size={14}/>
                                        <span>كلمة المرور: (مخفية)</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">لا يوجد حساب طالب</span>
                                <Button variant="outline" size="sm" onClick={() => onCreateStudentAccount(child)} icon={<UserPlus size={14} />} className="h-8 text-xs">
                                    إنشاء حساب
                                </Button>
                            </div>
                        )}
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
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full"><Award /></div>
                        <div>
                            <p className="text-xl font-bold">{earnedBadges.length}</p>
                            <p className="text-xs text-gray-500">إنجازات</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-700 mb-3">أحدث الأنشطة</h4>
                    <div className="space-y-3">
                         {recentActivity.length > 0 ? recentActivity.map(item => (
                            <Link to={item.link} state={{ defaultTab: 'myLibrary' }} key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                                <div className="flex-shrink-0"><ActivityIcon type={item.type}/></div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-gray-800">{item.summary}</p>
                                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
                                <ArrowLeft size={16} className="text-gray-400"/>
                            </Link>
                         )) : <p className="text-sm text-center text-gray-500 py-4">لا توجد أنشطة مسجلة لهذا الطفل بعد.</p>}
                    </div>
                    {earnedBadges.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-bold text-gray-700 mb-2">أحدث الإنجازات</h4>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {earnedBadges.slice(0, 3).map(badge => (
                                    <BadgeDisplay key={badge.id} badge={badge} size="lg" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChildDashboardCard);
