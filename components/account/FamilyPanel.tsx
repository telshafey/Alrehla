import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Users, UserPlus } from 'lucide-react';
import EmptyState from './EmptyState.tsx';
import ChildCard from './ChildCard.tsx';
import ChildProfileModal from '../order/ChildProfileModal.tsx'; // Reusing the modal from order
import type { ChildProfile } from '../../lib/database.types.ts';

const FamilyPanel: React.FC = () => {
    const { childProfiles } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [childToEdit, setChildToEdit] = useState<ChildProfile | null>(null);

    const handleAddChild = () => {
        setChildToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditChild = (child: ChildProfile) => {
        setChildToEdit(child);
        setIsModalOpen(true);
    };
    
    const handleDeleteChild = (childId: number) => {
        if(window.confirm('هل أنت متأكد من حذف ملف هذا الطفل؟')) {
            // In a real app, call a mutation here.
            console.log('Deleting child with ID:', childId);
        }
    }

    return (
       <>
         <ChildProfileModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            childToEdit={childToEdit}
         />
        <div className="space-y-6">
             {childProfiles.length > 0 ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold flex items-center gap-2"><Users /> أفراد عائلتي</h2>
                         <button onClick={handleAddChild} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                            <UserPlus size={18} />
                            <span>إضافة طفل</span>
                         </button>
                    </div>
                    <div className="space-y-4">
                        {childProfiles.map(child => (
                            <ChildCard 
                                key={child.id} 
                                child={child} 
                                onEdit={handleEditChild}
                                onDelete={handleDeleteChild}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={<Users className="w-12 h-12 text-gray-400" />}
                    title="لم تقم بإضافة أطفال بعد"
                    message="إضافة ملفات أطفالك يساعدنا على تخصيص تجربتهم وتسهيل عملية الطلب."
                    actionText="إضافة طفل جديد"
                    onAction={handleAddChild}
                />
            )}
        </div>
       </>
    );
};

export default FamilyPanel;
