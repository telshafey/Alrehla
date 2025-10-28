import React from 'react';
import { User, AlertCircle } from 'lucide-react';
import AdminSection from '../AdminSection';
import InstructorProfileEditor from './InstructorProfileEditor';
import type { Instructor } from '../../../lib/database.types';

interface InstructorProfilePanelProps {
    instructor: Instructor;
}

const InstructorProfilePanel: React.FC<InstructorProfilePanelProps> = ({ instructor }) => {
    const isUpdatePending = instructor.profile_update_status === 'pending';

    return (
        <AdminSection title="تعديل الملف الشخصي" icon={<User />}>
            {isUpdatePending ? (
                 <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-bold">لديك طلب تحديث قيد المراجعة حاليًا. لا يمكنك إرسال طلب جديد حتى يتم البت في الطلب الحالي.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-600 mb-4 -mt-2">
                   يمكنك تعديل نبذتك التعريفية أو السعر المقترح للجلسة. سيتم إرسال طلبك للمراجعة.
                </p>
            )}
           
           <InstructorProfileEditor instructor={instructor} disabled={isUpdatePending} />
       </AdminSection>
    );
};

export default InstructorProfilePanel;
