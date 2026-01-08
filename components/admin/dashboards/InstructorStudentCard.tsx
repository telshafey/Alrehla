
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, CheckCircle, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
                <div className="relative">
                    <img 
                        src={student.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                        alt={student.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/10 shadow-sm"
                    />
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{journeys.length} رحلات مرتبطة</p>
                </div>
            </div>

            {/* Journeys List */}
            <div className="space-y-4">
                 {journeys.map(journey => {
                    const isConfirmed = journey.status === 'مؤكد' || journey.status === 'مكتمل';
                    const isPending = journey.status === 'بانتظار المراجعة' || journey.status === 'بانتظار الدفع';
                    
                    const totalSessions = parseTotalSessions(journey.packageDetails?.sessions);
                    const completedCount = journey.sessions.filter(s => s.status === 'completed').length;
                    const progress = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

                    return (
                        <div key={journey.id} className={`p-4 rounded-xl border transition-colors ${
                            isConfirmed ? 'bg-green-50/30 border-green-100' : 'bg-orange-50/30 border-orange-100'
                        }`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{journey.package_name}</h4>
                                    <div className="mt-2">
                                        {isConfirmed ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                <ShieldCheck size={10} /> رحلة نشطة ومؤكدة
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">
                                                <Clock size={10} /> قيد مراجعة الإدارة (محجوز)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold">{completedCount} / {totalSessions || '?'}</span>
                                    <p className="text-[9px] text-muted-foreground uppercase">جلسات</p>
                                </div>
                            </div>

                            {/* Progress Bar - Only meaningful for confirmed journeys */}
                            {isConfirmed && (
                                <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                                    <div 
                                        className="bg-green-500 h-1 rounded-full transition-all duration-500" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex -space-x-1.5 rtl:space-x-reverse">
                                    {journey.sessions.slice(0, 5).map((s, idx) => (
                                        <div key={s.id} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold ${
                                            s.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                    ))}
                                </div>
                                
                                {isConfirmed ? (
                                    <Button as={Link} to={`/journey/${journey.id}`} size="sm" variant="success" className="h-8 text-[10px] font-bold">
                                        دخول مساحة العمل <ExternalLink size={12} className="mr-1" />
                                    </Button>
                                ) : (
                                    <div className="text-[9px] text-orange-600 font-bold bg-white px-2 py-1 rounded border border-orange-100">
                                        انتظر تفعيل الإدارة للبدء
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                 })}
            </div>
        </div>
    );
};

export default InstructorStudentCard;
