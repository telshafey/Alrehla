
import React, { useState, useMemo } from 'react';
import type { ChildProfile } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUserAccountData } from '../../hooks/queries/user/useUserDataQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import EmptyState from './EmptyState';
import ChildDashboardCard from './ChildDashboardCard';
import ChildForm from './ChildForm';
import StudentAccountForm from './StudentAccountForm';
import PageLoader from '../ui/PageLoader';

type ViewMode = 'list' | 'child-form' | 'student-form';

const FamilyCenterPanel: React.FC = () => {
    // We rely on useUserAccountData for the *list* of children to ensure it refreshes after mutations
    const { data: accountData, isLoading } = useUserAccountData();
    const { deleteChildProfile } = useUserMutations();

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
    
    // Use childProfiles from the query, fallback to empty array
    const childProfiles = accountData?.childProfiles || [];
    const { userOrders = [], userBookings = [], userSubscriptions = [], childBadges = [], allBadges = [] } = accountData || {};
    
    const activityByChildId = useMemo(() => {
        const map = new Map<number, { orders: any[], bookings: any[], subscriptions: any[] }>();

        childProfiles.forEach(child => {
            map.set(child.id, { orders: [], bookings: [], subscriptions: [] });
        });
        
        userOrders.forEach(order => {
            if (map.has(order.child_id)) {
                map.get(order.child_id)!.orders.push(order);
            }
        });
        userBookings.forEach(booking => {
            if (map.has(booking.child_id)) {
                map.get(booking.child_id)!.bookings.push(booking);
            }
        });
        userSubscriptions.forEach(subscription => {
            if (map.has(subscription.child_id)) {
                map.get(subscription.child_id)!.subscriptions.push(subscription);
            }
        });

        return map;
    }, [childProfiles, userOrders, userBookings, userSubscriptions]);


    // Handlers
    const handleAddChild = () => {
        setSelectedChild(null);
        setViewMode('child-form');
    };

    const handleEditChild = (child: ChildProfile) => {
        setSelectedChild(child);
        setViewMode('child-form');
    };
    
    const handleDeleteChild = (childId: number) => {
        if(window.confirm('هل أنت متأكد من حذف ملف هذا الطفل؟ هذا الإجراء قد يحذف أي حساب طالب مرتبط به.')) {
            deleteChildProfile.mutate({ childId });
        }
    };

    const handleCreateStudentAccount = (child: ChildProfile) => {
        setSelectedChild(child);
        setViewMode('student-form');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedChild(null);
    };

    if (isLoading) {
        return <div className="bg-white p-8 rounded-2xl shadow-lg"><PageLoader text="جاري تحميل بيانات العائلة..." /></div>
    }

    // --- Render Views ---

    if (viewMode === 'child-form') {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <ChildForm 
                    childToEdit={selectedChild} 
                    onCancel={handleBackToList}
                    onSuccess={handleBackToList}
                />
            </div>
        );
    }

    if (viewMode === 'student-form' && selectedChild) {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <StudentAccountForm
                    childProfile={selectedChild}
                    onCancel={handleBackToList}
                    onSuccess={handleBackToList}
                />
            </div>
        );
    }

    // Default View: List
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Users /> المركز العائلي
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">إدارة ملفات أطفالك وحساباتهم التعليمية.</p>
                </div>
                 {childProfiles.length > 0 && (
                    <Button onClick={handleAddChild} icon={<UserPlus size={18} />} size="sm">
                        إضافة طفل
                    </Button>
                )}
            </div>
            
            {childProfiles.length > 0 ? (
                <div className="space-y-8 animate-fadeIn">
                    {childProfiles.map(child => (
                       <ChildDashboardCard 
                            key={child.id}
                            child={child}
                            childActivity={activityByChildId.get(child.id) || { orders: [], bookings: [], subscriptions: [] }}
                            allBadges={allBadges}
                            childBadges={childBadges}
                            onEdit={handleEditChild}
                            onDelete={handleDeleteChild}
                            onCreateStudentAccount={handleCreateStudentAccount}
                       />
                    ))}
                </div>
            ) : (
                <EmptyState 
                    icon={<Users className="w-12 h-12 text-gray-400" />}
                    title="أضف أطفالك لبدء رحلتهم"
                    message="بإضافة طفلك الأول، ستتم ترقية حسابك إلى 'ولي أمر' وتتمكن من الاستفادة من كافة خدمات المنصة المخصصة."
                    actionText="أضف طفلك الأول"
                    onAction={handleAddChild}
                />
            )}
        </div>
    );
};

export default FamilyCenterPanel;
