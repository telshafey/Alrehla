import React from 'react';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { formatDate } from '../../utils/helpers.ts';
// FIX: Imported `Subscription` type from `database.types.ts` instead of a non-existent context.
import type { Subscription } from '../../lib/database.types.ts';

interface SubscriptionsPanelProps {
    userSubscriptions: Subscription[];
}

const SubscriptionsPanel: React.FC<SubscriptionsPanelProps> = ({ userSubscriptions }) => {
    const activeSubscriptions = userSubscriptions.filter(s => s.status === 'active');
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold mb-4">صندوق الرحلة الشهري</h2>
            {activeSubscriptions.length > 0 ? (
                activeSubscriptions.map(sub => (
                    <div key={sub.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <div className="flex items-center gap-3">
                            <Gift className="text-orange-500" />
                            <p className="font-bold text-lg text-gray-800">اشتراك نشط للطفل: {sub.child_name}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">تاريخ التجديد القادم: <span className="font-semibold">{formatDate(sub.next_renewal_date)}</span></p>
                        <div className="mt-4">
                            <button className="text-sm text-gray-500 hover:underline">إدارة الاشتراك</button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">ليس لديك أي اشتراكات نشطة حاليًا.</p>
                    <Link to="/enha-lak/subscription" className="text-blue-600 font-bold hover:underline">اكتشف صندوق الرحلة الشهري</Link>
                </div>
            )}
        </div>
    );
};

export default SubscriptionsPanel;
