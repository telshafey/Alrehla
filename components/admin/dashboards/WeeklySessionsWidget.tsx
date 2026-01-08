
import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/Button';
import { formatDate } from '../../../utils/helpers';
import SessionReportModal from './SessionReportModal';
import RequestSessionChangeModal from './RequestSessionChangeModal';
import GoogleCalendarSyncModal from './GoogleCalendarSyncModal';

interface WeeklySessionsWidgetProps {
    sessions: any[];
    instructorName: string;
}

const WeeklySessionsWidget: React.FC<WeeklySessionsWidgetProps> = ({ sessions, instructorName }) => {
    const [reportModalSession, setReportModalSession] = useState<any>(null);
    const [rescheduleModalSession, setRescheduleModalSession] = useState<any>(null);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

    // 1. حساب حدود الأسبوع الحالي (من السبت للجمعة)
    const weekData = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        // جعل السبت هو بداية الأسبوع في السياق العربي
        const day = now.getDay(); 
        const diff = (day === 6 ? 0 : day + 1); // حساب الفرق للوصول للسبت الماضي
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
            <GoogleCalendarSyncModal 
                isOpen={isSyncModalOpen} 
                onClose={() => setIsSyncModalOpen(false)} 
            />

            {/* Header with Google Sync */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <CalendarDays className="text-primary" /> جلسات الأسبوع الحالي
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">من {formatDate(weekData.startOfWeek.toISOString())} إلى {formatDate(weekData.endOfWeek.toISOString())}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsSyncModalOpen(true)} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm transition-all hover:scale-105">
                    <Calendar size={16} /> ربط مع تقويم Google
                </Button>
            </div>

            {/* Past Sessions - Needs Action */}
            {weekData.pastNeedsAction.length > 0 && (
                <div className="animate-fadeIn">
                    <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                        <AlertCircle size={16} /> جلسات فائتة تحتاج تقرير أو إعادة جدولة ({weekData.pastNeedsAction.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {weekData.pastNeedsAction.map(session => (
                            <Card key={session.id} className="border-red-100 bg-red-50/30">
                                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold shadow-sm">
                                            {new Date(session.session_date).getDate()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{session.child_name || 'طالب'}</p>
                                            <p className="text-[10px] text-red-700 font-semibold">{formatDate(session.session_date)} - الساعة {new Date(session.session_date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button size="sm" variant="success" className="flex-1 sm:flex-none h-8 text-[10px]" onClick={() => setReportModalSession(session)}>
                                            كتابة التقرير
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-8 text-[10px] border-red-200 text-red-700" onClick={() => setRescheduleModalSession(session)}>
                                            إعادة جدولة
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming This Week */}
            <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" /> الجلسات القادمة المتبقية
                </h3>
                {weekData.upcomingThisWeek.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weekData.upcomingThisWeek.map(session => {
                            const isToday = new Date(session.session_date).toDateString() === new Date().toDateString();
                            return (
                                <Card key={session.id} className={`${isToday ? 'border-primary shadow-md bg-primary/5' : 'bg-white'}`}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isToday ? 'bg-primary text-white animate-bounce' : 'bg-muted text-muted-foreground'}`}>
                                                    {isToday ? 'اليوم' : formatDate(session.session_date).split(' ')[0]}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground">{new Date(session.session_date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                                <a href={`#/session/${session.id}`} target="_blank"><ExternalLink size={14}/></a>
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <CheckCircle2 size={16}/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{session.child_name}</p>
                                                <p className="text-[10px] text-muted-foreground">{session.package_name}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                        <p className="text-sm text-muted-foreground italic">لا توجد جلسات أخرى متبقية في هذا الأسبوع.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {reportModalSession && (
                <SessionReportModal 
                    isOpen={!!reportModalSession} 
                    onClose={() => setReportModalSession(null)} 
                    session={reportModalSession} 
                />
            )}
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
