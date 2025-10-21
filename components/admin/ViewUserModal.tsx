import React, { useRef, useEffect } from 'react';
import { X, User, ShoppingBag, CheckSquare } from 'lucide-react';
import type { UserProfile as UserType } from '../../contexts/AuthContext.tsx';
import type { CreativeWritingBooking } from '../../lib/database.types.ts';
import { formatDate, getStatusColor } from '../../utils/helpers.ts';
import type { IOrderDetails } from './ViewOrderModal.tsx';
import { useModalAccessibility } from '../../hooks/useModalAccessibility.ts';

interface ViewUserModalProps {
  user: UserType | null;
  userOrders: IOrderDetails[];
  userBookings: CreativeWritingBooking[];
  isOpen: boolean;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, userOrders, userBookings, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-12" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 m-4 animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="user-modal-title" className="text-2xl font-bold text-gray-800">ملف المستخدم</h2>
          <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
            {/* User Details */}
            <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <User /> {user.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p><span className="font-semibold text-gray-500">البريد الإلكتروني:</span> {user.email}</p>
                    <p><span className="font-semibold text-gray-500">تاريخ التسجيل:</span> {formatDate(user.created_at)}</p>
                    <p><span className="font-semibold text-gray-500">الدور:</span> {user.role}</p>
                </div>
            </div>

            {/* Orders */}
            <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <ShoppingBag /> طلبات "إنها لك" ({userOrders.length})
                </h3>
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {userOrders.length > 0 ? (
                         <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-right font-semibold">الطلب</th>
                                    <th className="px-4 py-2 text-right font-semibold">التاريخ</th>
                                    <th className="px-4 py-2 text-right font-semibold">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                            {userOrders.map(order => (
                                <tr key={order.id} className="border-t">
                                    <td className="px-4 py-2">{order.item_summary}</td>
                                    <td className="px-4 py-2">{formatDate(order.order_date)}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <p className="text-center text-gray-500 p-4">لا توجد طلبات.</p>}
                </div>
            </div>
            
             {/* Bookings */}
             <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckSquare /> حجوزات "بداية الرحلة" ({userBookings.length})
                </h3>
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                     {userBookings.length > 0 ? (
                         <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-right font-semibold">الحجز</th>
                                    <th className="px-4 py-2 text-right font-semibold">التاريخ</th>
                                    <th className="px-4 py-2 text-right font-semibold">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                            {userBookings.map(booking => (
                                <tr key={booking.id} className="border-t">
                                    <td className="px-4 py-2">{booking.package_name}</td>
                                    <td className="px-4 py-2">{formatDate(booking.booking_date)}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <p className="text-center text-gray-500 p-4">لا توجد حجوزات.</p>}
                </div>
            </div>

        </div>

        <div className="flex justify-end pt-6 mt-8 border-t">
            <button type="button" onClick={onClose} className="px-8 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;