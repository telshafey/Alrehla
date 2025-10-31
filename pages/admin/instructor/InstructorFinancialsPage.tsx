import React from 'react';
import { useInstructorData } from '../../../hooks/queries/instructor/useInstructorDataQuery';
import PageLoader from '../../../components/ui/PageLoader';
import InstructorFinancialsPanel from '../../../components/admin/dashboards/InstructorFinancialsPanel';

const InstructorFinancialsPage: React.FC = () => {
    const { data, isLoading } = useInstructorData();

    if (isLoading || !data) {
        return <PageLoader text="جاري تحميل البيانات المالية..." />;
    }
    
    if (!data.instructor) {
        return <div className="text-center text-red-500 p-4">لم يتم العثور على ملف المدرب الخاص بك.</div>;
    }

    const { instructor, bookings, serviceOrders, payouts } = data;

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">الماليات</h1>
            <InstructorFinancialsPanel 
                instructor={instructor}
                bookings={bookings}
                serviceOrders={serviceOrders}
                payouts={payouts}
            />
        </div>
    );
};

export default InstructorFinancialsPage;