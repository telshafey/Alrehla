
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';
import { Button } from '../../ui/Button';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../../lib/database.types';

interface StudentProfile {
    name: string;
    avatar_url: string | null;
}

interface Journey {
    id: string;
    package_name: string;
    status: string;
    sessions: ScheduledSession[];
    packageDetails?: CreativeWritingPackage;
}

const parseTotalSessions = (sessionString: string | undefined): number => {
    if (!sessionString) return 0;
    const match = sessionString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const InstructorStudentCard: React.FC<{ student: StudentProfile; journeys: Journey[] }> = ({ student, journeys }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 mb-4">
                <img 
                    src={student.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                    alt={student.name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="flex-grow text-center sm:text-right">
                    <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
                </div>
            </div>

            {/* Journeys List */}
            <div className="space-y-4">
                 {journeys.map(journey => {
                    const totalSessions = parseTotalSessions(journey.packageDetails?.sessions);
                    const completedSessionsCount = journey.sessions.filter(s => s.status === 'completed').length;
                    const sortedSessions = [...(journey.sessions || [])].sort((a,b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

                    return (
                        <div key={journey.id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-purple-800">{journey.package_name}</h4>
                                    <p className="text-xs text-gray-500">الحالة: {journey.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">{completedSessionsCount}/{totalSessions || '?'}</p>
                                    <p className="text-xs text-gray-500">جلسة مكتملة</p>
                                </div>
                            </div>
                            <div className="mt-3 border-t pt-3">
                                <h5 className="text-sm font-semibold mb-2">الجلسات المجدولة:</h5>
                                <div className="space-y-2 text-xs">
                                    {sortedSessions.length > 0 ? sortedSessions.map(s => (
                                        <div key={s.id} className="flex items-center gap-2">
                                            {s.status === 'completed' ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-blue-500" />}
                                            <span className={s.status === 'completed' ? 'line-through text-gray-500' : ''}>
                                                {formatDate(s.session_date)} - {new Date(s.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )) : <p className="text-xs text-gray-500">لا توجد جلسات مجدولة بعد.</p>}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button asChild size="sm" variant="outline">
                                    <Link to={`/journey/${journey.id}`}>
                                        مساحة العمل
                                        <ArrowLeft size={16} className="mr-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                 })}
            </div>
        </div>
    );
};

export default InstructorStudentCard;