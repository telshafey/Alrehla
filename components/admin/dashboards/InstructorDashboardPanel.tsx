import React from 'react';
import StatCard from '../StatCard';
import { Calendar, BookOpen, Award } from 'lucide-react';
import type { Instructor } from '../../../lib/database.types';

type EnrichedBooking = any; 
type InstructorTab = 'dashboard' | 'journeys' | 'financials' | 'schedule' | 'profile';

interface InstructorDashboardPanelProps {
    instructor: Instructor;
    bookings: EnrichedBooking[];
    introSessionsCount: number;
    onNavigateTab: (tab: InstructorTab) => void;
}

const InstructorDashboardPanel: React.FC<InstructorDashboardPanelProps> = ({ instructor, bookings, introSessionsCount, onNavigateTab }) => {

    const upcomingSessionsCount = bookings.reduce((count, booking) => {
        return count + (booking.sessions?.filter((s: any) => s.status === 'upcoming').length || 0);
    }, 0);

    const activeJourneysCount = bookings.filter((b: any) => b.status === 'مؤكد').length;
    
    const introSessionGoalMet = introSessionsCount >= 1;

    return (
        <div className="space-y-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800">نظرة عامة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="الجلسات القادمة" 
                    value={upcomingSessionsCount} 
                    icon={<Calendar size={28} className="text-blue-500" />} 
                    color="bg-blue-100"
                    onClick={() => onNavigateTab('schedule')}
                />
                <StatCard 
                    title="الرحلات النشطة" 
                    value={activeJourneysCount} 
                    icon={<BookOpen size={28} className="text-purple-500" />} 
                    color="bg-purple-100" 
                    onClick={() => onNavigateTab('journeys')}
                />
                <StatCard 
                    title="الجلسات التعريفية (هذا الشهر)" 
                    value={`${introSessionsCount} / 1`}
                    icon={<Award size={28} className={introSessionGoalMet ? "text-green-500" : "text-yellow-500"} />} 
                    color={introSessionGoalMet ? "bg-green-100" : "bg-yellow-100"}
                />
            </div>
             {!introSessionGoalMet && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                    <p className="text-sm font-bold">تذكير: مطلوب منك إكمال جلسة تعريفية واحدة على الأقل شهرياً.</p>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboardPanel;