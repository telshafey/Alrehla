
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Calendar, Globe, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/Button';
import { formatDate, formatTime } from '../../../utils/helpers';
import RequestSessionChangeModal from './RequestSessionChangeModal';
import GoogleCalendarSyncModal from './GoogleCalendarSyncModal';

interface WeeklySessionsWidgetProps {
    sessions: any[];
    instructorName: string;
}

const WeeklySessionsWidget: React.FC<WeeklySessionsWidgetProps> = ({ sessions, instructorName }) => {
    const navigate = useNavigate();
    const [rescheduleModalSession, setRescheduleModalSession] = useState<any>(null);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

    const weekData = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = now.getDay(); 
        const diff = (day === 6 ? 0 : day + 1); 
        startOfWeek.setDate(now.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const currentWeekSessions = sessions.filter(s => {
            const sDate = new Date(s.session_date);
            return sDate >= startOfWeek && sDate <= endOfWeek;
        });

        const pastNeedsAction = currentWeekSessions.filter(s => 
            new Date(s.session_date) < now && s.status === 'upcoming'
        );

        const upcomingThisWeek = currentWeekSessions.filter(s => 
            new Date(s.session_date) >= now
        ).sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

        return { pastNeedsAction, upcomingThisWeek, startOfWeek, endOfWeek };
    }, [sessions]);

    return (
        <div className="space-y-6">
            <GoogleCalendarSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <CalendarDays className="text-primary" /> أجندة الأسبوع الحالي
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <p>من {formatDate(weekData.startOfWeek.toISOString())} إلى {formatDate(weekData.endOfWeek.toISOString())}</p>
                        <span>•</span>
                        <p className="flex items-center gap-1 font-bold text-indigo-600"><Globe size={10}/> توقيت القاهرة</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsSyncModalOpen(true)} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Calendar size={16} /> ربط مع Google Calendar
                </Button>
            </div>

            {weekData.pastNeedsAction.length > 0 && (
                <div className="animate-fadeIn">
                    <h3 className="text-xs font-black text-red-600 mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <AlertCircle size={14} /> مهام معلقة ({weekData.pastNeedsAction.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {weekData.pastNeedsAction.map(session => (
                            <Card key={session.id} className="border-red-100 bg-red-50/30">
                                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-black">
                                            {new Date(session.session_date).getDate()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{session.child_name || 'طالب'}</p>
                                            <p className="text-[10px] text-red-700 font-bold">
                                                فات موعدها: {formatDate(session.session_date)} - {formatTime(session.session_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button 
                                            size="sm" 
                                            variant="success" 
                                            className="flex-1 sm:flex-none h-9 text-[10px] font-black" 
                                            onClick={() => navigate(`/admin/session-report/${session.id}`)}
                                        >
                                            كتابة التقرير
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="flex-1 sm:flex-none h-9 text-[10px] border-red-200 text-red-700 font-black" 
                                            onClick={() => setRescheduleModalSession(session)}
                                        >
                                            إعادة جدولة
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xs font-black text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <Clock size={14} className="text-blue-500" /> ما تبقى من الأسبوع
                </h3>
                {weekData.upcomingThisWeek.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weekData.upcomingThisWeek.map(session => (
                            <Card key={session.id} className="bg-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-gray-400">
                                            {formatDate(session.session_date)} - {formatTime(session.session_date)}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate(`/admin/session-report/${session.id}`)}>
                                            <ExternalLink size={14}/>
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <CheckCircle2 size={18}/>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-gray-800 truncate">{session.child_name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{session.package_name}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-12 text-muted-foreground font-bold italic bg-gray-50 rounded-2xl border-2 border-dashed">
                        لا توجد جلسات أخرى متبقية في جدولك لهذا الأسبوع.
                    </p>
                )}
            </div>

            {rescheduleModalSession && (
                <RequestSessionChangeModal 
                    isOpen={!!rescheduleModalSession}
                    onClose={() => setRescheduleModalSession(null)}
                    session={rescheduleModalSession}
                    childName={rescheduleModalSession.child_name}
                />
            )}
        </div>
    );
};

export default WeeklySessionsWidget;
