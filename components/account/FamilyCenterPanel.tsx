import React, { useState, useMemo } from 'react';
import type { ChildProfile } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUserAccountData } from '../../hooks/queries/user/useUserDataQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import EmptyState from './EmptyState';
import ChildProfileModal from './ChildProfileModal';
import CreateStudentAccountModal from '../auth/CreateStudentAccountModal';
import ChildDashboardCard from './ChildDashboardCard';

const FamilyCenterPanel: React.FC = () => {
    const { childProfiles } = useAuth();
    const { data: accountData, isLoading } = useUserAccountData();
    const { deleteChildProfile } = useUserMutations();

    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [childToEdit, setChildToEdit] = useState<ChildProfile | null>(null);
    const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);
    const [childToLink, setChildToLink] = useState<ChildProfile | null>(null);
    
    const { userOrders = [], userBookings = [], userSubscriptions = [] } = accountData || {};
    
    const allUserActivity = useMemo(() => ({
        orders: userOrders,
        bookings: userBookings,
        subscriptions: userSubscriptions,
    }), [userOrders, userBookings, userSubscriptions]);


    const handleAddChild = () => {
        setChildToEdit(null);
        setIsChildModalOpen(true);
    };

    const handleEditChild = (child: ChildProfile) => {
        setChildToEdit(child);
        setIsChildModalOpen(true);
    };
    
    const handleDeleteChild = (childId: number) => {
        if(window.confirm('هل أنت متأكد من حذف ملف هذا الطفل؟ هذا الإجراء قد يحذف أي حساب طالب مرتبط به.')) {
            deleteChildProfile.mutate({ childId });
        }
    };

    const handleCreateStudentAccount = (child: ChildProfile) => {
        setChildToLink(child);
        setIsCreateStudentModalOpen(true);
    };

    if (isLoading && childProfiles.length === 0) {
        return <div className="bg-white p-8 rounded-2xl shadow-lg">جاري التحميل...</div>
    }

    return (
        <>
            <ChildProfileModal 
                isOpen={isChildModalOpen}
                onClose={() => setIsChildModalOpen(false)}
                childToEdit={childToEdit}
            />
             <CreateStudentAccountModal
                isOpen={isCreateStudentModalOpen}
                onClose={() => setIsCreateStudentModalOpen(false)}
                childProfile={childToLink}
            />
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Users /> المركز العائلي
                    </h2>
                     {childProfiles.length > 0 && (
                        <Button onClick={handleAddChild} icon={<UserPlus size={18} />} size="sm">
                            إضافة طفل
                        </Button>
                    )}
                </div>
                
                {childProfiles.length > 0 ? (
                    <div className="space-y-8">
                        {childProfiles.map(child => (
                           <ChildDashboardCard 
                                key={child.id}
                                child={child}
                                allUserActivity={allUserActivity}
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
                        message="المركز العائلي هو مكانك لإدارة ملفات أطفالك، ومتابعة رحلاتهم الإبداعية، وإنشاء حسابات طلابية لهم."
                        actionText="أضف طفلك الأول"
                        onAction={handleAddChild}
                    />
                )}
            </div>
        </>
    );
};

export default FamilyCenterPanel;