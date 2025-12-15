
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
import WritingDraftPanel from '../components/student/WritingDraftPanel';
import { MessageSquare, Paperclip, FileText, Calendar, Clock, Video, CheckCircle, Send, Upload, Save, FileCheck2, PenSquare, Award, MoreVertical, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';
import type { SessionAttachment, ScheduledSession, Badge } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import Dropdown from '../components/ui/Dropdown';
import Modal from '../components/ui/Modal';
import BadgeDisplay from '../components/shared/BadgeDisplay';

// --- Sub-components ---

const DiscussionSection: React.FC<{ messages: any[]; journeyId: string; canInteract: boolean }> = ({ messages, journeyId, canInteract }) => {
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        console.log('Sending message:', { journeyId, senderId: currentUser?.id, message: newMessage });
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow space-y-4 max-h-full overflow-y-auto p-2">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_role === 'instructor' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender_role === 'instructor' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                            <p className="text-sm font-bold">{msg.sender_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                            <p>{msg.message_text}</p>
                            <p className={`text-xs mt-1 text-right ${msg.sender_role === 'instructor' ? 'text-muted-foreground' : 'text-blue-200'}`}>{new Date(msg.created_at).toLocaleTimeString('ar-EG')}</p>
                        </div>
                    </div>
                )) : <p className="text-muted-foreground text-center py-4">لا توجد رسائل بعد. ابدأ النقاش!</p>}
            </div>
            {canInteract && (
                <div className="pt-4 border-t mt-auto">
                    <Textarea placeholder="اكتب رسالتك هنا..." rows={3} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <Button className="mt-2" onClick={handleSendMessage} icon={<Send size={16}/>}>إرسال</Button>
                </div>
            )}
        </div>
    );
};

const AttachmentsSection: React.FC<{ attachments: any[]; journeyId: string; canInteract: boolean; isStudentOrParent: boolean; onOrderReview: (attachment: SessionAttachment) => void; }> = ({ attachments, journeyId, canInteract, isStudentOrParent, onOrderReview }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = () => {
        if (!file) return;
        console.log('Uploading file:', { journeyId, file: file.name });
        setFile(null);
        const input = document.getElementById('file-upload') as HTMLInputElement;
        if (input) input.value = '';
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow space-y-2 max-h-full overflow-y-auto p-2">
                {attachments.length > 0 ? attachments.map(att => (
                    <Card key={att.id}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                 <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                    <Paperclip className="text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold text-primary">{att.file_name}</p>
                                        <p className="text-xs text-muted-foreground">تم الرفع بواسطة {att.uploader_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                                    </div>
                                </a>
                                {isStudentOrParent && att.uploader_role === 'student' && (
                                    <Button size="sm" variant="outline" onClick={() => onOrderReview(att)} icon={<FileCheck2 size={16} />}>
                                        اطلب مراجعة
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )) : <p className="text-muted-foreground text-center py-4">لا توجد مرفقات.</p>}
            </div>
            {canInteract && (
                <div className="pt-4 border-t mt-auto">
                     <input type="file" id="file-upload" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-2"/>
                     <Button variant="outline" className="w-full" onClick={handleUpload} disabled={!file} icon={<Upload size={16} />}>رفع ملف جديد</Button>
                </div>
            )}
        </div>
    );
};

const NotesSection: React.FC<{ 
    notes: string;
    isInstructor: boolean;
    onNotesChange: (notes: string) => void;
    onSave: () => void;
    isSaving: boolean;
}> = ({ notes, isInstructor, onNotesChange, onSave, isSaving }) => {
    if (isInstructor) {
        return (
            <div className="space-y-4">
                <Textarea 
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    rows={8}
                    placeholder="اكتب ملاحظاتك حول تقدم الطالب هنا... (هذه الملاحظات مرئية للطالب وولي الأمر)"
                />
                <div className="flex items-center gap-2">
                    <Button onClick={onSave} loading={isSaving} icon={<Save />}>
                        حفظ الملاحظات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {notes ? (
                <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><FileText size={18}/> ملاحظات المدرب</h4>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{notes}</p>
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-8">لا توجد ملاحظات من المدرب بعد.</p>
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

    const handleSubmit = () => {
        if (selectedBadge) {
            onGrant(Number(selectedBadge));
            onClose();
            setSelectedBadge('');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="منح شارة إنجاز"
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button onClick={handleSubmit} disabled={!selectedBadge}>منح الشارة</Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">اختر الشارة التي تريد منحها للطالب تقديراً لجهوده.</p>
                <div className="grid grid-cols-2 gap-4">
                    {badges.map(badge => (
                        <div 
                            key={badge.id} 
                            className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${selectedBadge == badge.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`}
                            onClick={() => setSelectedBadge(badge.id)}
                        >
                            <div className="scale-75"><BadgeDisplay badge={badge} /></div>
                            <span className="font-bold text-xs">{badge.name}</span>
                        </div>
                    ))}
                </div>
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
    const { currentUser, childProfiles } = useAuth();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    
    // Hooks
    const { data: journeyData, isLoading, error, refetch } = useTrainingJourneyData(journeyId);
    const { data: publicData } = usePublicData(); 
    const { updateBookingProgressNotes } = useBookingMutations(); 
    const { awardBadge } = useGamificationMutations();
    
    // State
    const [activeTab, setActiveTab] = useState<'draft' |'discussion' | 'attachments' | 'notes'>('draft');
    const [notesContent, setNotesContent] = useState('');
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

    React.useEffect(() => {
        if(journeyData?.booking?.progress_notes) {
            setNotesContent(journeyData.booking.progress_notes);
        }
    }, [journeyData]);
    
    const canInteract = currentUser?.role === 'student' || currentUser?.role === 'instructor' || currentUser?.role === 'user';
    const isInstructor = currentUser?.role === 'instructor';
    const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'user';

    const childName = useMemo(() => {
        if (!journeyData) return '';
        const child = childProfiles.find(c => c.id === journeyData.booking.child_id);
        return child?.name || journeyData.booking.child_profiles?.name || '';
    }, [journeyData, childProfiles]);

    const { upcomingSessions, pastSessions, totalSessions, completedSessionsCount, progress } = useMemo(() => {
        if (!journeyData) return { upcomingSessions: [], pastSessions: [], totalSessions: 0, completedSessionsCount: 0, progress: 0 };

        const allSessions = journeyData.scheduledSessions || [];
        const upcoming = allSessions
            .filter(s => s.status === 'upcoming')
            .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
            
        const past = allSessions
            .filter(s => s.status !== 'upcoming')
            .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

        const total = parseTotalSessions(journeyData.package?.sessions);
        const completed = past.filter(s => s.status === 'completed').length;
        
        return { 
            upcomingSessions: upcoming, 
            pastSessions: past,
            totalSessions: total,
            completedSessionsCount: completed,
            progress: total > 0 ? (completed / total) * 100 : 0
        };

    }, [journeyData]);

    if (isLoading) return <PageLoader text="جاري تحميل رحلتك التدريبية..." />;
    if (error || !journeyData) return <div className="text-center text-red-500 py-20">{error?.message || 'لم يتم العثور على الرحلة.'}</div>;

    const { booking, package: pkg, instructor, messages, attachments, additionalServices } = journeyData;
    const allBadges = (publicData?.badges || []) as Badge[]; // Correct property usage

    // Handlers
    const handleSaveNotes = async () => {
        if (!booking?.id) return;
        await updateBookingProgressNotes.mutateAsync({
            bookingId: booking.id,
            notes: notesContent,
        });
    };

    const handleOrderService = (serviceName: string, context?: any) => {
        const service = additionalServices.find((s: any) => s.name === serviceName);
        if (!service) {
            addToast(`عفواً، خدمة "${serviceName}" غير متاحة حالياً.`, 'error');
            return;
        }

        let summary = `${service.name} لـ ${childName}`;
        if (context?.fileName) {
            summary = `${service.name} (${context.fileName}) لـ ${childName}`;
        }
        
        addItemToCart({
            type: 'order',
            payload: {
                productKey: `service_${service.id}`,
                summary,
                totalPrice: service.price,
                details: {
                    serviceName: service.name,
                    childId: booking.child_id,
                    journeyId: booking.id,
                    ...context
                }
            }
        });
        addToast(`تمت إضافة "${service.name}" إلى السلة بنجاح!`, 'success');
    };

    const handleGrantBadge = async (badgeId: number) => {
        if(!instructor) return;
        await awardBadge.mutateAsync({
            childId: booking.child_id,
            badgeId,
            instructorId: instructor.id
        });
    };

    // Instructor: Mark session as completed (Mock logic for UI demo)
    const handleCompleteSession = (sessionId: string) => {
        if (!window.confirm('هل أنت متأكد من تحديد هذه الجلسة كمكتملة؟')) return;
        // Ideally call a mutation here. For demo, we just toast.
        addToast('تم تحديث حالة الجلسة (محاكاة)', 'success');
        refetch(); // Reload data to reflect change if mutation existed
    };

    const workspaceTabs = [
        { key: 'draft', label: 'مسودة الكتابة', icon: <PenSquare size={16} /> },
        { key: 'discussion', label: 'النقاش', icon: <MessageSquare size={16} /> },
        { key: 'attachments', label: 'المرفقات', icon: <Paperclip size={16} /> },
        { key: 'notes', label: 'ملاحظات المدرب', icon: <FileText size={16} /> },
    ];
    
    return (
        <div className="bg-muted/50 py-12 animate-fadeIn">
            {isInstructor && (
                 <GrantBadgeModal 
                    isOpen={isBadgeModalOpen} 
                    onClose={() => setIsBadgeModalOpen(false)} 
                    onGrant={handleGrantBadge} 
                    badges={allBadges} 
                 />
            )}

            <div className="container mx-auto px-4">
                 <Card className="mb-8 border-t-4 border-t-primary">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-3xl">{pkg?.name || booking.package_name}</CardTitle>
                            <CardDescription>
                                {isInstructor 
                                    ? `مساحة العمل مع الطالب: ${childName}` 
                                    : 'هذه هي مساحة العمل الخاصة برحلتك الإبداعية. بالتوفيق!'}
                            </CardDescription>
                        </div>
                        {isInstructor && (
                            <Button variant="outline" className="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50" onClick={() => setIsBadgeModalOpen(true)}>
                                <Award size={18} /> منح شارة
                            </Button>
                        )}
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Workspace */}
                    <div className="lg:col-span-2">
                        <Card className="h-full min-h-[600px]">
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                                    <TabsList className="mb-6">
                                        {workspaceTabs.map(tab => (
                                            <TabsTrigger key={tab.key} value={tab.key}>
                                                {tab.icon} {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <TabsContent value="draft"><WritingDraftPanel journeyId={booking.id} canInteract={canInteract} /></TabsContent>
                                    <TabsContent value="discussion"><DiscussionSection messages={messages} journeyId={booking.id} canInteract={canInteract} /></TabsContent>
                                    <TabsContent value="attachments"><AttachmentsSection attachments={attachments} journeyId={booking.id} canInteract={canInteract} isStudentOrParent={isStudentOrParent} onOrderReview={(att) => handleOrderService('مراجعة نص', { attachmentId: att.id, fileName: att.file_name })} /></TabsContent>
                                    <TabsContent value="notes">
                                        <NotesSection 
                                            notes={notesContent}
                                            isInstructor={isInstructor}
                                            onNotesChange={setNotesContent}
                                            onSave={handleSaveNotes}
                                            isSaving={updateBookingProgressNotes.isPending}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Right Column: Sidebar Stats & Sessions */}
                    <div className="lg:col-span-1 space-y-6 sticky top-24">
                        <Card>
                             <CardHeader>
                                <div className="flex items-center gap-3">
                                    <img src={instructor?.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor?.name} className="w-12 h-12 rounded-full object-cover"/>
                                    <div>
                                        <CardTitle className="text-lg">المدرب</CardTitle>
                                        <CardDescription>{instructor?.name}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-sm font-bold text-muted-foreground mb-2">تقدم الرحلة</h3>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 text-center">{completedSessionsCount}/{totalSessions} جلسة مكتملة</p>

                                {upcomingSessions[0] && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h3 className="text-sm font-bold text-muted-foreground mb-2">اللقاء القادم</h3>
                                        <div className="p-3 bg-primary/10 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm">{formatDate(upcomingSessions[0].session_date)}</p>
                                                <p className="text-xs">{new Date(upcomingSessions[0].session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <Button asChild size="sm" variant="success"><Link to={`/session/${upcomingSessions[0].id}`}><Video size={14}/> انضم</Link></Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="text-lg">سجل الجلسات</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-80 overflow-y-auto space-y-3">
                                {upcomingSessions.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <Clock size={16} className="text-primary"/>
                                            <span>{formatDate(s.session_date)}</span>
                                        </div>
                                        {isInstructor && (
                                            <Dropdown 
                                                trigger={<MoreVertical size={16} className="text-muted-foreground" />}
                                                items={[
                                                    { label: 'تحديد كمكتملة', action: () => handleCompleteSession(s.id) },
                                                    { label: 'لم يحضر الطالب', action: () => alert('سيتم خصم الجلسة') },
                                                ]}
                                            />
                                        )}
                                    </div>
                                ))}
                                {pastSessions.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg opacity-75">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {s.status === 'completed' ? <CheckCircle size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}
                                            <span className="line-through">{formatDate(s.session_date)}</span>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground">{s.status === 'completed' ? 'مكتملة' : 'فائتة'}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingJourneyPage;
