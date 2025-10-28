import React from 'react';
import { MessageSquare } from 'lucide-react';
import AdminSection from '../AdminSection';
import WeeklyScheduleManager from '../WeeklyScheduleManager';
import type { Instructor } from '../../../lib/database.types';

interface InstructorSchedulePanelProps {
    instructor: Instructor;
}

const InstructorSchedulePanel: React.FC<InstructorSchedulePanelProps> = ({ instructor }) => {
    return (
        <AdminSection title="إدارة الجدول الأسبوعي" icon={<MessageSquare />}>
            <p className="text-sm text-gray-600 mb-4 -mt-2">
                حدد الأوقات التي تكون فيها متاحًا بشكل أسبوعي. سيتم مراجعة طلبك من قبل الإدارة قبل تطبيقه على النظام.
            </p>
            <WeeklyScheduleManager instructor={instructor} />
        </AdminSection>
    );
};

export default InstructorSchedulePanel;
