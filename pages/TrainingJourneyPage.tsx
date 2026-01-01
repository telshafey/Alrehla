
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrainingJourneyData } from '../hooks/queries/user/useJourneyDataQuery';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import { useGamificationMutations } from '../hooks/mutations/useGamificationMutations';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import ErrorState from '../components/ui/ErrorState';
import WritingDraftPanel from '../components/student/WritingDraftPanel';
import { 
    MessageSquare, Paperclip, FileText, Calendar, Clock, Video, 
    CheckCircle, Send, Upload, Save, PenSquare, 
    Award, ArrowLeft, Hourglass, Edit3, XCircle, PlayCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Input } from '../components/ui/Input';
import { formatDate } from '../utils/helpers';
import type { SessionAttachment, ScheduledSession, Badge } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';
import BadgeDisplay from '../components/shared/BadgeDisplay';
import { bookingService } from '../services/bookingService';

const SessionControlModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    session: ScheduledSession | null;
    onUpdate: () => void;
}> = ({ isOpen, onClose, session, onUpdate }) => {
    const { addToast } = useToast();
    const [status, setStatus] = useState(session?.status || 'completed');
    const [notes, setNotes] = useState(session?.notes || '');
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!session) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            if (isRescheduling) {
                if (!newDate || !reason) {
                    addToast('يرجى تحديد الموعد الجديد وذكر السبب.', 'warning');
                    return;
                }
                await bookingService.updateScheduledSession(session.id, { new_date: newDate, reason });
                addToast('تمت إعادة جدولة الجلسة بنجاح.', 'success');
            } else {
                await bookingService.updateScheduledSession(session.id, { status, notes });
                addToast('تم تحديث حالة الجلسة.', 'success');
            }
            onUpdate();
            onClose();
        } catch (e) {
            addToast('فشل التحديث.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إدارة الجلسة" footer={<Button onClick={handleSave} loading={loading}>{isRescheduling ? 'تأكيد الجدولة' : 'حفظ الحالة'}</Button>}>
            <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button onClick={() => setIsRescheduling(false)} className={`flex-1 py-2 text-xs font-bold rounded-md ${!isRescheduling ? 'bg-white shadow' : ''}`}>تحديث الحالة</button>
                    <button onClick={() => setIsRescheduling(true)} className={`flex-1 py-2 text-xs font-bold rounded-md ${isRescheduling ? 'bg-white shadow' : ''}`}>إعادة جدولة</button>
                </div>

                {!isRescheduling ? (
                    <>
                        <div>
                            <label className="text-xs font-bold mb-2 block">حالة الجلسة</label>
                            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 border rounded-md">
                                <option value="completed">تمت بنجاح</option>
                                <option value="missed">لم يحضر الطالب</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold mb-2 block">ملاحظات للجلسة (اختياري)</label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="اكتب تقييماً سريعاً لهذه الجلسة..."/>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="text-xs font-bold mb-2 block">الموعد الجديد</label>
                            <Input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold mb-2 block">سبب إعادة الجدولة</label>
                            <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="توضيح سبب التغيير للطالب والإدارة..."/>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

const TrainingJourneyPage: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    const { data: journeyData, isLoading, error, refetch } = useTrainingJourneyData(journeyId);
    const { data: publicData } = usePublicData(); 
    const { awardBadge } = useGamificationMutations();
    
    const [activeTab, setActiveTab] = useState<'draft' |'discussion' | 'attachments' | 'notes'>('draft');
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);

    const isInstructor = currentUser?.role === 'instructor';
    
    const { allSessions, progress, completedSessionsCount } = useMemo(() => {
        if (!journeyData) return { allSessions: [], progress: 0, completedSessionsCount: 0 };
        const all = [...(journeyData.scheduledSessions || [])].sort((a,b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
        const total = all.length;
        const completed = all.filter(s => s.status === 'completed').length;
        return { allSessions: all, progress: total > 0 ? (completed / total) * 100 : 0, completedSessionsCount: completed };
    }, [journeyData]);

    if (isLoading) return <PageLoader />;
    if (error || !journeyData) return <ErrorState message="الرحلة غير موجودة" />;

    return (
        <div className="bg-muted/40 py-10 animate-fadeIn min-h-screen">
            <SessionControlModal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} session={selectedSession} onUpdate={refetch} />
            
            <div className="container mx-auto px-4 max-w-7xl">
                 <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link to="/account" className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
                             <ArrowLeft size={12} className="rotate-180"/> العودة
                        </Link>
                        <h1 className="text-3xl font-black text-gray-800">{journeyData.booking.package_name}</h1>
                        <p className="text-muted-foreground font-medium">الطالب: {journeyData.childProfile?.name}</p>
                    </div>
                    {isInstructor && <Button variant="special" size="sm" onClick={() => setIsBadgeModalOpen(true)} icon={<Award size={18}/>}>منح شارة إنجاز</Button>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <Card className="min-h-[600px]">
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                    <TabsList className="mb-8">
                                        <TabsTrigger value="draft"><PenSquare size={16}/> القصة</TabsTrigger>
                                        <TabsTrigger value="discussion"><MessageSquare size={16}/> النقاش</TabsTrigger>
                                        <TabsTrigger value="attachments"><Paperclip size={16}/> الملفات</TabsTrigger>
                                        <TabsTrigger value="notes"><FileText size={16}/> التقييم</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="draft"><WritingDraftPanel journeyId={journeyData.booking.id} canInteract={!!currentUser} /></TabsContent>
                                    <TabsContent value="notes"><div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 italic">{journeyData.booking.progress_notes || "لا توجد ملاحظات."}</div></TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">الجدول الزمني</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    {allSessions.map((s, idx) => {
                                        const isCompleted = s.status === 'completed';
                                        const isMissed = s.status === 'missed';

                                        return (
                                            <div key={s.id} className={`p-3 rounded-xl border relative transition-all ${isCompleted ? 'bg-green-50 border-green-100 opacity-80' : isMissed ? 'bg-red-50 border-red-100 opacity-80' : 'bg-white border-gray-100 shadow-sm'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black">الجلسة {idx + 1}</span>
                                                    {isInstructor && !isCompleted && !isMissed && (
                                                        <button onClick={() => setSelectedSession(s)} className="text-primary hover:bg-primary/10 p-1 rounded-full"><Edit3 size={14}/></button>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold">{formatDate(s.session_date)}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] text-muted-foreground">{new Date(s.session_date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
                                                    {isCompleted ? (
                                                        <CheckCircle size={14} className="text-green-600"/>
                                                    ) : isMissed ? (
                                                        <XCircle size={14} className="text-red-600"/>
                                                    ) : (
                                                        <Button 
                                                            as={Link} 
                                                            to={`/session/${s.id}`} 
                                                            size="sm" 
                                                            variant={isInstructor ? 'default' : 'ghost'} 
                                                            className={`h-7 text-[10px] px-3 font-bold ${isInstructor ? 'bg-blue-600' : ''}`}
                                                        >
                                                            {isInstructor ? (
                                                                <><PlayCircle size={12} className="ml-1"/> ابدأ الجلسة</>
                                                            ) : 'انضم'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingJourneyPage;
