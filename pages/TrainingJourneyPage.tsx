
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrainingJourneyData } from '../hooks/queries/user/useJourneyDataQuery';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import { useGamificationMutations } from '../hooks/mutations/useGamificationMutations';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import ErrorState from '../components/ui/ErrorState';
import WritingDraftPanel from '../components/student/WritingDraftPanel';
import { 
    MessageSquare, Paperclip, FileText, Calendar, Clock, Video, 
    CheckCircle, Send, Upload, Save, FileCheck2, PenSquare, 
    Award, MoreVertical, XCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';
import type { SessionAttachment, ScheduledSession, Badge } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';
import BadgeDisplay from '../components/shared/BadgeDisplay';

// --- Sub-components ---

const DiscussionSection: React.FC<{ messages: any[]; journeyId: string; canInteract: boolean }> = ({ messages, journeyId, canInteract }) => {
    const { currentUser } = useAuth();
    const { sendSessionMessage } = useBookingMutations();
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;
        
        await sendSessionMessage.mutateAsync({
            bookingId: journeyId,
            senderId: currentUser.id,
            role: currentUser.role,
            message: newMessage.trim()
        });
        
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow space-y-4 max-h-full overflow-y-auto p-2">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_role === 'instructor' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender_role === 'instructor' ? 'bg-muted' : 'bg-primary text-primary-foreground shadow-md'}`}>
                            <p className="text-[10px] font-bold opacity-70 mb-1">{msg.sender_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                            <p className="text-sm">{msg.message_text}</p>
                            <p className={`text-[10px] mt-1 text-left ${msg.sender_role === 'instructor' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                )) : <p className="text-muted-foreground text-center py-10 italic">لا توجد رسائل بعد. ابدأ النقاش مع مدربك!</p>}
            </div>
            {canInteract && (
                <div className="pt-4 border-t mt-auto">
                    <div className="flex gap-2">
                        <Textarea 
                            placeholder="اكتب رسالتك هنا..." 
                            rows={2} 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sendSessionMessage.isPending}
                        />
                        <Button 
                            className="h-auto" 
                            onClick={handleSendMessage} 
                            loading={sendSessionMessage.isPending}
                            icon={<Send size={16}/>}
                        >
                            إرسال
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AttachmentsSection: React.FC<{ 
    attachments: any[]; 
    journeyId: string; 
    canInteract: boolean; 
    isStudentOrParent: boolean; 
}> = ({ attachments, journeyId, canInteract, isStudentOrParent }) => {
    const { currentUser } = useAuth();
    const { uploadSessionAttachment } = useBookingMutations();
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!file || !currentUser) return;
        
        await uploadSessionAttachment.mutateAsync({
            bookingId: journeyId,
            uploaderId: currentUser.id,
            role: currentUser.role,
            file: file
        });

        setFile(null);
        const input = document.getElementById('file-upload') as HTMLInputElement;
        if (input) input.value = '';
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow space-y-3 max-h-full overflow-y-auto p-2">
                {attachments.length > 0 ? attachments.map(att => (
                    <div key={att.id} className="p-4 border rounded-xl bg-white hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex justify-between items-center">
                             <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Paperclip size={20} /></div>
                                <div>
                                    <p className="font-bold text-sm text-foreground truncate max-w-[200px]">{att.file_name}</p>
                                    <p className="text-[10px] text-muted-foreground">بواسطة {att.uploader_role === 'instructor' ? 'المدرب' : 'الطالب'} • {formatDate(att.created_at)}</p>
                                </div>
                            </a>
                            <Button as="a" href={att.file_url} target="_blank" size="sm" variant="ghost" className="h-8 text-xs">
                                عرض الملف
                            </Button>
                        </div>
                    </div>
                )) : <p className="text-muted-foreground text-center py-10 italic">لم يتم رفع أي مرفقات بعد.</p>}
            </div>
            {canInteract && (
                <div className="pt-4 border-t mt-auto">
                     <div className="p-3 bg-muted/30 rounded-lg border border-dashed mb-3">
                        <input 
                            type="file" 
                            id="file-upload" 
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                            className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            disabled={uploadSessionAttachment.isPending}
                        />
                     </div>
                     <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleUpload} 
                        disabled={!file || uploadSessionAttachment.isPending} 
                        loading={uploadSessionAttachment.isPending}
                        icon={<Upload size={16} />}
                    >
                        رفع ملف جديد
                    </Button>
                </div>
            )}
        </div>
    );
};

const GrantBadgeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGrant: (badgeId: number) => void;
    badges: Badge[];
}> = ({ isOpen, onClose, onGrant, badges }) => {
    const [selectedBadge, setSelectedBadge] = useState<number | string>('');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="منح شارة إنجاز"
            footer={<><Button variant="ghost" onClick={onClose}>إلغاء</Button><Button onClick={() => {if(selectedBadge){onGrant(Number(selectedBadge)); onClose();}}} disabled={!selectedBadge}>منح الشارة</Button></>}
        >
            <div className="grid grid-cols-2 gap-4">
                {badges.map(badge => (
                    <div key={badge.id} className={`border rounded-xl p-3 cursor-pointer transition-all ${selectedBadge == badge.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`} onClick={() => setSelectedBadge(badge.id)}>
                        <div className="scale-75"><BadgeDisplay badge={badge} /></div>
                        <span className="font-bold text-xs block text-center mt-2">{badge.name}</span>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

const parseTotalSessions = (sessionString: string | undefined): number => {
    if (!sessionString) return 0;
    if (sessionString.includes('واحدة')) return 1;
    const match = sessionString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const TrainingJourneyPage: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    const { data: journeyData, isLoading, error, refetch } = useTrainingJourneyData(journeyId);
    const { data: publicData } = usePublicData(); 
    const { updateBookingProgressNotes } = useBookingMutations(); 
    const { awardBadge } = useGamificationMutations();
    
    const [activeTab, setActiveTab] = useState<'draft' |'discussion' | 'attachments' | 'notes'>('draft');
    const [notesContent, setNotesContent] = useState('');
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

    React.useEffect(() => {
        if(journeyData?.booking?.progress_notes) setNotesContent(journeyData.booking.progress_notes);
    }, [journeyData]);
    
    const isInstructor = currentUser?.role === 'instructor';
    const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'user' || currentUser?.role === 'parent';
    const canInteract = !!currentUser;

    const { upcomingSessions, pastSessions, totalSessions, completedSessionsCount, progress } = useMemo(() => {
        if (!journeyData) return { upcomingSessions: [], pastSessions: [], totalSessions: 0, completedSessionsCount: 0, progress: 0 };
        const all = journeyData.scheduledSessions || [];
        const upcoming = all.filter(s => s.status === 'upcoming').sort((a,b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
        const past = all.filter(s => s.status !== 'upcoming').sort((a,b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
        const total = parseTotalSessions(journeyData.package?.sessions);
        const completed = past.filter(s => s.status === 'completed').length;
        return { upcomingSessions: upcoming, pastSessions: past, totalSessions: total, completedSessionsCount: completed, progress: total > 0 ? (completed / total) * 100 : 0 };
    }, [journeyData]);

    if (isLoading) return <PageLoader text="جاري تحميل مساحة العمل..." />;
    if (error || !journeyData) return <ErrorState message={error?.message || "الرحلة غير موجودة"} />;

    const { booking, instructor, childProfile } = journeyData;

    return (
        <div className="bg-muted/40 py-10 animate-fadeIn min-h-screen">
            {isInstructor && (
                <GrantBadgeModal 
                    isOpen={isBadgeModalOpen} 
                    onClose={() => setIsBadgeModalOpen(false)} 
                    onGrant={(id) => awardBadge.mutate({childId: booking.child_id, badgeId: id, instructorId: instructor.id})} 
                    badges={publicData?.badges || []} 
                />
            )}

            <div className="container mx-auto px-4 max-w-7xl">
                 <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link to="/account" className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
                             <ArrowLeft size={12} className="rotate-180"/> العودة لحسابي
                        </Link>
                        <h1 className="text-3xl font-black text-gray-800">{journeyData.package?.name || booking.package_name}</h1>
                        <p className="text-muted-foreground font-medium">رحلة الطالب المبدع: {childProfile?.name}</p>
                    </div>
                    {isInstructor && <Button variant="special" size="sm" onClick={() => setIsBadgeModalOpen(true)} icon={<Award size={18}/>}>منح شارة إنجاز</Button>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="min-h-[700px] shadow-sm border-t-4 border-t-primary">
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                    <TabsList className="mb-8 h-12 bg-gray-100/50 p-1">
                                        <TabsTrigger value="draft" className="text-xs font-bold"><PenSquare size={16}/> مسودة القصة</TabsTrigger>
                                        <TabsTrigger value="discussion" className="text-xs font-bold"><MessageSquare size={16}/> النقاش</TabsTrigger>
                                        <TabsTrigger value="attachments" className="text-xs font-bold"><Paperclip size={16}/> المرفقات</TabsTrigger>
                                        <TabsTrigger value="notes" className="text-xs font-bold"><FileText size={16}/> ملاحظات التقييم</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="draft"><WritingDraftPanel journeyId={booking.id} canInteract={canInteract} /></TabsContent>
                                    <TabsContent value="discussion"><DiscussionSection messages={journeyData.messages} journeyId={booking.id} canInteract={canInteract} /></TabsContent>
                                    <TabsContent value="attachments"><AttachmentsSection attachments={journeyData.attachments} journeyId={booking.id} canInteract={canInteract} isStudentOrParent={isStudentOrParent} /></TabsContent>
                                    <TabsContent value="notes">
                                        <div className="space-y-4">
                                            {isInstructor ? (
                                                <>
                                                    <Textarea value={notesContent} onChange={e => setNotesContent(e.target.value)} rows={10} placeholder="اكتب تقرير التقدم وملاحظاتك الفنية هنا..." />
                                                    <div className="flex justify-end"><Button onClick={() => updateBookingProgressNotes.mutate({bookingId: booking.id, notes: notesContent})} loading={updateBookingProgressNotes.isPending} icon={<Save/>}>حفظ الملاحظات</Button></div>
                                                </>
                                            ) : <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 whitespace-pre-wrap leading-relaxed text-gray-800">{notesContent || "لم يكتب المدرب أي ملاحظات بعد."}</div>}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold">المشرف التدريبي</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                                <img src={instructor?.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} className="w-12 h-12 rounded-full object-cover border-2 border-primary/10" alt=""/>
                                <div><p className="font-bold text-sm">{instructor?.name}</p><p className="text-[10px] text-muted-foreground">{instructor?.specialty}</p></div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">حالة الرحلة</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-1 text-[10px] font-bold"><span>الإنجاز</span><span>{completedSessionsCount}/{totalSessions} جلسة</span></div>
                                <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader><CardTitle className="text-sm font-bold">مواعيد الجلسات</CardTitle></CardHeader>
                             <CardContent className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                {upcomingSessions.map(s => (
                                    <div key={s.id} className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex justify-between items-center">
                                        <div className="flex flex-col"><span className="text-[10px] font-bold text-blue-700">{formatDate(s.session_date)}</span><span className="text-[10px] text-blue-600 font-mono">{new Date(s.session_date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span></div>
                                        <Button as={Link} to={`/session/${s.id}`} size="sm" variant="success" className="h-7 text-[10px] px-2">انضم</Button>
                                    </div>
                                ))}
                                {pastSessions.map(s => (
                                    <div key={s.id} className="p-2 rounded-lg bg-gray-50 border flex justify-between items-center opacity-60">
                                        <span className="text-[10px] line-through">{formatDate(s.session_date)}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground">مكتملة</span>
                                    </div>
                                ))}
                                {upcomingSessions.length === 0 && pastSessions.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4 italic">لا توجد جلسات مجدولة حالياً.</p>
                                )}
                             </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingJourneyPage;
