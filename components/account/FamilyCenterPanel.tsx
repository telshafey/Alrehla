
import React, { useState, useMemo } from 'react';
import type { ChildProfile } from '../../contexts/AuthContext';
import { useUserAccountData, type EnrichedChildProfile } from '../../hooks/queries/user/useUserDataQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import EmptyState from './EmptyState';
import ChildDashboardCard from './ChildDashboardCard';
import ChildForm from './ChildForm';
import StudentAccountForm from './StudentAccountForm';
import StudentPasswordModal from './StudentPasswordModal';
import PageLoader from '../ui/PageLoader';

type ViewMode = 'list' | 'child-form' | 'student-form';

const FamilyCenterPanel: React.FC = () => {
    const { data: accountData, isLoading } = useUserAccountData();
    const { deleteChildProfile } = useUserMutations();

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedChild, setSelectedChild] = useState<EnrichedChildProfile | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
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


    const handleAddChild = () => {
        setSelectedChild(null);
        setViewMode('child-form');
    };

    const handleEditChild = (child: EnrichedChildProfile) => {
        setSelectedChild(child);
        setViewMode('child-form');
    };
    
    // Deletion removed from UI or handled restrictively
    const handleDeleteChild = (childId: number) => {
        // Optional: Keep this function but remove UI trigger if needed, or make it stricter
        if(window.confirm('تحذير: هل أنت متأكد من حذف ملف هذا الطفل؟ سيتم حذف جميع البيانات المرتبطة به.')) {
            deleteChildProfile.mutate({ childId });
        }
    };

    const handleCreateStudentAccount = (child: EnrichedChildProfile) => {
        setSelectedChild(child);
        setViewMode('student-form');
    };

    const handleResetPassword = (child: EnrichedChildProfile) => {
        setSelectedChild(child);
        setIsPasswordModalOpen(true);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedChild(null);
    };

    if (isLoading) {
        return <div className="bg-white p-8 rounded-2xl shadow-lg"><PageLoader text="جاري تحميل بيانات العائلة..." /></div>
    }

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

    return (
        <>
            <StudentPasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
                child={selectedChild}
            />
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
                                onResetPassword={handleResetPassword}
                           />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        icon={<Users className="w-12 h-12 text-gray-400" />}
                        title="أضف أطفالك لبدء رحلتهم"
                        message="بإضافة طفلك الأول، ستتمكن من الاستفادة من كافة خدمات المنصة المخصصة."
                        actionText="أضف طفلك الأول"
                        onAction={handleAddChild}
                    />
                )}
            </div>
        </>
    );
};

export default FamilyCenterPanel;
