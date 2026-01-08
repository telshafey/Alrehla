
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, BookOpen, CreditCard, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUserAccountData } from '../../hooks/queries/user/useUserDataQuery';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, daysInMonth, firstDayOfMonth } from '../../utils/helpers';
import EmptyState from './EmptyState';
import { Button } from '../ui/Button';
import type { Order, Subscription, CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../lib/database.types';
import StatusBadge from '../ui/StatusBadge';

type EnrichedBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails: CreativeWritingPackage | undefined;
    instructorName: string;
};

const JourneyCalendarView: React.FC<{ journey: EnrichedBooking }> = ({ journey }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { packageDetails, sessions, instructorName } = journey;

    // استخراج العدد بشكل آمن
    const getTotalSessionsCount = (pkg: CreativeWritingPackage | undefined) => {
        if (!pkg) return 0;
        if (pkg.name.includes('التعريفية') || pkg.sessions.includes('واحدة')) return 1;
        const match = pkg.sessions.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    };

    const totalSessions = getTotalSessionsCount(packageDetails);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const upcomingSessions = sessions.filter(s => s.status === 'upcoming')
        .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
    const nextSession = upcomingSessions[0];

    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long' });
    const year = currentDate.getFullYear();

    const getSessionForDay = (day: number) => {
        return sessions.find(s => {
            const sessionDate = new Date(s.session_date);
            return sessionDate.getFullYear() === currentDate.getFullYear() &&
                   sessionDate.getMonth() === currentDate.getMonth() &&
                   sessionDate.getDate() === day;
        });
    };
    
    const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const daysArray = Array.from({ length: daysInMonth(currentDate) }, (_, i) => i + 1);
    const startingDay = firstDayOfMonth(currentDate);

    return (
        <div className="p-4 sm:p-6 border rounded-2xl bg-purple-50/30">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full flex-shrink-0"><BookOpen /></div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">{packageDetails?.name}</p>
                        <div className="text-sm text-gray-500">مع {instructorName}</div>
                    </div>
                </div>
                 <Link to={`/journey/${journey.id}`} className="flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors self-end sm:self-center">
                    <span>افتح مساحة العمل</span>
                    <ArrowLeft size={16} />
                </Link>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div>
                         <h4 className="font-bold text-gray-700">تقدم الجلسات</h4>
                         <p className="text-sm text-gray-500">مكتمل: {completedSessions.length} من {totalSessions || 'عدة'} جلسات</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
                        <span className="font-bold w-24 text-center">{monthName} {year}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                    {dayNames.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {daysArray.map(day => {
                        const session = getSessionForDay(day);
                        const isNext = nextSession && new Date(nextSession.session_date).toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                        let dayClass = 'text-gray-700 hover:bg-gray-100';
                        if (session) {
                            dayClass = session.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800';
                        }
                        if(isNext) {
                            dayClass += ' ring-2 ring-offset-2 ring-blue-500';
                        }
                        return (
                            <div key={day} className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors text-sm ${dayClass}`}>
                                {day}
                            </div>
                        )
                    })}
                </div>
                 <div className="flex items-center justify-center gap-4 mt-4 text-xs border-t pt-2">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-200"></span> مكتملة</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-200"></span> قادمة</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full ring-2 ring-blue-500"></span> التالية</div>
                </div>
            </div>
        </div>
    );
};


interface MyLibraryPanelProps {
    onPay: (item: { id: string; type: 'order' | 'subscription' | 'booking' }) => void;
}

const MyLibraryPanel: React.FC<MyLibraryPanelProps> = ({ onPay }) => {
    const { data } = useUserAccountData();
    const { childProfiles } = useAuth();
    const { userOrders: orders = [], userSubscriptions: subscriptions = [], userBookings: bookings = [] } = data || {};
    const [activeTab, setActiveTab] = useState<'enha-lak' | 'creative-writing'>('enha-lak');
    
    const enhaLakItemsExist = orders.length > 0 || subscriptions.length > 0;

    const bookingsByChild = useMemo(() => {
        const map = new Map<number, { childName: string, journeys: EnrichedBooking[] }>();
        (bookings as EnrichedBooking[]).forEach((booking: EnrichedBooking) => {
            const child = childProfiles.find(c => c.id === booking.child_id);
            if(child){
                if (!map.has(child.id)) {
                    map.set(child.id, { childName: child.name, journeys: [] });
                }
                map.get(child.id)!.journeys.push(booking);
            }
        });
        return Array.from(map.values());
    }, [bookings, childProfiles]);
    
    const creativeWritingItemsExist = bookings.length > 0;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BookOpen /> مكتبتي</h2>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 rtl:space-x-reverse">
                    <button
                        onClick={() => setActiveTab('enha-lak')}
                        className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === 'enha-lak' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <ShoppingBag size={16} /> إنها لك
                    </button>
                    <button
                        onClick={() => setActiveTab('creative-writing')}
                        className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === 'creative-writing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <BookOpen size={16} /> بداية الرحلة
                    </button>
                </nav>
            </div>

            <div className="mt-8">
                {activeTab === 'enha-lak' && (
                    <div className="space-y-8 animate-fadeIn">
                        {enhaLakItemsExist ? (
                            <>
                                {subscriptions.length > 0 && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-700 mb-4">الاشتراكات</h3>
                                        <div className="space-y-4">
                                            {subscriptions.map((sub: Subscription) => (
                                                <div key={sub.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-orange-50/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full"><Star /></div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">صندوق الرحلة ({sub.plan_name}) - {sub.child_name}</p>
                                                            <p className="text-sm text-gray-500">التجديد القادم: {formatDate(sub.next_renewal_date)}</p>
                                                        </div>
                                                    </div>
                                                     <div className="flex items-center gap-2 flex-wrap justify-end">
                                                        <StatusBadge status={sub.status} />
                                                        {sub.status === 'pending_payment' && <Button onClick={() => onPay({ id: sub.id, type: 'subscription' })} variant="success" size="sm" icon={<CreditCard size={14} />}>ادفع الآن</Button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {orders.length > 0 && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-700 mb-4">الطلبات الفردية</h3>
                                        <div className="space-y-4">
                                            {orders.map((item: Order) => (
                                                <div key={item.id} className="p-4 border rounded-lg">
                                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0"><ShoppingBag className="text-blue-500" /></div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{item.item_summary}</p>
                                                                <p className="text-sm text-gray-500">{formatDate(item.order_date)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap justify-end mt-3 sm:mt-0">
                                                            <StatusBadge status={item.status} />
                                                            {item.status === 'بانتظار الدفع' && <Button onClick={() => onPay({ id: item.id, type: 'order' })} variant="success" size="sm" icon={<CreditCard size={14} />}>ادفع الآن</Button>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        ) : (
                            <EmptyState icon={<ShoppingBag className="w-12 h-12 text-gray-400" />} title="لا توجد منتجات من 'إنها لك' بعد" message="عندما تطلب قصة مخصصة أو تشترك في صندوق الرحلة، ستظهر منتجاتك هنا." actionText="اكتشف منتجات 'إنها لك'" onAction={() => window.location.hash = '/enha-lak/store'} />
                        )}
                    </div>
                )}
                {activeTab === 'creative-writing' && (
                    <div className="animate-fadeIn">
                        {creativeWritingItemsExist ? (
                             <div className="space-y-8">
                                {bookingsByChild.map(({ childName, journeys }) => (
                                    <div key={childName}>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">رحلات {childName}</h3>
                                        <div className="space-y-6">
                                            {journeys.map(journey => (
                                                <JourneyCalendarView key={journey.id} journey={journey} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <EmptyState icon={<BookOpen className="w-12 h-12 text-gray-400" />} title="لم تبدأ أي رحلة تدريبية بعد" message="عندما تقوم بحجز باقة من برنامج 'بداية الرحلة'، ستظهر رحلتك هنا." actionText="اكتشف برنامج بداية الرحلة" onAction={() => window.location.hash = '/creative-writing'} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLibraryPanel;
