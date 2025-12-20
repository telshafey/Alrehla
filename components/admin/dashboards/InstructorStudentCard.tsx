
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';
import { Button } from '../../ui/Button';
import type { ScheduledSession, CreativeWritingPackage } from '../../../lib/database.types';

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
        <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
                <img 
                    src={student.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                    alt={student.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/10 shadow-sm"
                />
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                    <p className="text-xs text-muted-foreground">{journeys.length} رحلات مسجلة</p>
                </div>
            </div>

            {/* Journeys List */}
            <div className="space-y-4">
                 {journeys.map(journey => {
                    const totalSessions = parseTotalSessions(journey.packageDetails?.sessions);
                    const completedSessions = journey.sessions.filter(s => s.status === 'completed');
                    const completedCount = completedSessions.length;
                    const progress = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

                    return (
                        <div key={journey.id} className="p-4 bg-muted/30 rounded-xl border border-muted/50">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-primary">{journey.package_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                            journey.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {journey.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold">{completedCount} / {totalSessions || '?'}</span>
                                    <p className="text-[10px] text-muted-foreground uppercase">الجلسات</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                <div 
                                    className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                    {journey.sessions.slice(0, 3).map((s, idx) => (
                                        <div key={s.id} title={formatDate(s.session_date)} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${
                                            s.status === 'completed' ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {s.status === 'completed' ? <CheckCircle size={12} /> : idx + 1}
                                        </div>
                                    ))}
                                    {journey.sessions.length > 3 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-600">
                                            +{journey.sessions.length - 3}
                                        </div>
                                    )}
                                </div>
                                <Button as={Link} to={`/journey/${journey.id}`} size="sm" variant="outline" className="h-8 text-xs">
                                    دخول مساحة العمل <ExternalLink size={12} className="mr-1" />
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
