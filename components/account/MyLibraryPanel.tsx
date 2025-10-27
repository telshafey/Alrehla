import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, BookOpen, CreditCard, ArrowLeft } from 'lucide-react';
import { getStatusColor, formatDate } from '../../utils/helpers';
import EmptyState from './EmptyState';
import { Button } from '../ui/Button';
import type { Order, Subscription, CreativeWritingBooking } from '../../lib/database.types';
import { mockInstructors } from '../../data/mockData';

// Re-defining for this component
interface OrderItem extends Order {}
interface SubscriptionItem extends Subscription {}
interface BookingItem extends CreativeWritingBooking {}

interface MyLibraryPanelProps {
    orders: OrderItem[];
    subscriptions: SubscriptionItem[];
    bookings: BookingItem[];
    onPay: (item: { id: string; type: 'order' | 'subscription' }) => void;
}

const getSubStatusText = (status: Subscription['status']) => {
    switch (status) {
        case 'active': return 'نشط';
        case 'paused': return 'متوقف مؤقتاً';
        case 'cancelled': return 'ملغي';
        case 'pending_payment': return 'بانتظار الدفع';
        default: return status;
    }
};

const getSubStatusColor = (status: Subscription['status']) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'paused': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};


const MyLibraryPanel: React.FC<MyLibraryPanelProps> = ({ orders, subscriptions, bookings, onPay }) => {
    const [activeTab, setActiveTab] = useState<'enha-lak' | 'creative-writing'>('enha-lak');
    
    const enhaLakItemsExist = orders.length > 0 || subscriptions.length > 0;
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
                                            {subscriptions.map(sub => (
                                                <div key={sub.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-orange-50/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full"><Star /></div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">صندوق الرحلة الشهري ({sub.child_name})</p>
                                                            <p className="text-sm text-gray-500">التجديد القادم: {formatDate(sub.next_renewal_date)}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getSubStatusColor(sub.status)}`}>{getSubStatusText(sub.status)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {orders.length > 0 && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-700 mb-4">الطلبات الفردية</h3>
                                        <div className="space-y-4">
                                            {orders.map(item => (
                                                <div key={item.id} className="p-4 border rounded-lg">
                                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0"><ShoppingBag className="text-blue-500" /></div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{item.summary}</p>
                                                                <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap justify-end mt-3 sm:mt-0">
                                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
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
                             <div className="space-y-4">
                                {bookings.map(booking => {
                                    const instructor = mockInstructors.find(i => i.id === booking.instructor_id);
                                    return (
                                         <div key={booking.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-purple-50/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full"><BookOpen /></div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{booking.package_name}</p>
                                                    <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                                                        <span>مع {instructor?.name || 'مدرب'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/journey/${booking.id}`} className="flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors self-end sm:self-center">
                                                <span>افتح مساحة العمل</span>
                                                <ArrowLeft size={16} />
                                            </Link>
                                        </div>
                                    );
                                })}
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
