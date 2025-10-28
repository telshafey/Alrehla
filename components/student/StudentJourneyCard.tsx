import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock } from 'lucide-react';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';

type EnrichedStudentBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails?: CreativeWritingPackage;
    instructor_name?: string;
};

interface StudentJourneyCardProps {
    journey: EnrichedStudentBooking;
}

const StudentJourneyCard: React.FC<StudentJourneyCardProps> = ({ journey }) => {
    const upcomingSessions = journey.sessions
        .filter(s => s.status === 'upcoming')
        .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
    
    const nextSession = upcomingSessions[0];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full flex-shrink-0"><BookOpen /></div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">{journey.package_name}</p>
                        <div className="text-sm text-gray-500">مع المدرب: {journey.instructor_name}</div>
                    </div>
                </div>
                <Link to={`/journey/${journey.id}`} className="flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors self-end sm:self-center">
                    <span>افتح مساحة العمل</span>
                    <ArrowLeft size={16} />
                </Link>
            </div>
            {nextSession && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-600 mb-2">جلستك القادمة:</h4>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <Clock size={16} className="text-blue-500" />
                        <p className="text-sm font-semibold">{formatDate(nextSession.session_date)} - {new Date(nextSession.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentJourneyCard;
