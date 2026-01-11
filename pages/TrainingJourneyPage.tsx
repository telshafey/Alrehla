
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrainingJourneyData } from '../hooks/queries/user/useJourneyDataQuery';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import PageLoader from '../components/ui/PageLoader';
import ErrorState from '../components/ui/ErrorState';
import WritingDraftPanel from '../components/student/WritingDraftPanel';
import { 
    MessageSquare, Paperclip, FileText, Send, Upload, 
    Edit3, ArrowLeft, Download, Loader2, User, ShieldAlert, GraduationCap, Users, UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import type { UserRole } from '../lib/database.types';

const TrainingJourneyPage: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { data: journeyData, isLoading, refetch } = useTrainingJourneyData(journeyId);
    const { sendSessionMessage, uploadSessionAttachment } = useBookingMutations();

    const [activeTab, setActiveTab] = useState<'draft' | 'discussion' | 'attachments'>('draft');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // التمرير لأسفل المحادثة تلقائياً عند وصول رسائل جديدة
    useEffect(() => {
        if (activeTab === 'discussion') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [journeyData?.messages, activeTab]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !journeyId || !currentUser) return;
        
        const messageToSend = newMessage;
        setNewMessage(''); // Optimistic clear
        
        try {
            await sendSessionMessage.mutateAsync({
                bookingId: journeyId,
                senderId: currentUser.id,
                role: currentUser.role, // This must match allowed values in DB Constraint
                message: messageToSend
            });
            // Refetch to confirm and show the message
            refetch();
        } catch (error: any) {
            setNewMessage(messageToSend); // Restore message on fail
            // Error handling done in mutation hook
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !journeyId || !currentUser) return;

        try {
            await uploadSessionAttachment.mutateAsync({
                bookingId: journeyId,
                uploaderId: currentUser.id,
                role: currentUser.role,
                file
            });
            // Reset input to allow re-uploading same file if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
            refetch(); // Refresh to show new attachment
        } catch (error: any) {
             // Error handling done in mutation hook
        }
    };
    
    // دالة مساعدة لتحديد هوية المرسل وتنسيق الرسالة
    const getSenderInfo = (role: UserRole, senderId: string) => {
        const isMe = currentUser?.id === senderId;
        
        let label = 'مستخدم';
        let icon = <User size={12} />;
        let bubbleColor = 'bg-white border-gray-200 text-gray-800';
        let align = isMe ? 'justify-end' : 'justify-start';

        // Custom Labels & Colors based on Role
        switch (role) {
            case 'student':
                label = 'الطالب';
                icon = <GraduationCap size={12} />;
                if (!isMe) bubbleColor = 'bg-blue-50 border-blue-200 text-blue-900';
                break;
            case 'parent':
            case 'user':
                label = 'ولي الأمر';
                icon = <Users size={12} />;
                if (!isMe) bubbleColor = 'bg-green-50 border-green-200 text-green-900';
                break;
            case 'instructor':
                label = 'المدرب';
                icon = <UserCheck size={12} />;
                if (!isMe) bubbleColor = 'bg-amber-50 border-amber-200 text-amber-900';
                break;
            case 'super_admin':
            case 'general_supervisor':
            case 'creative_writing_supervisor':
                label = 'الإدارة / المشرف';
                icon = <ShieldAlert size={12} />;
                if (!isMe) bubbleColor = 'bg-red-50 border-red-200 text-red-900';
                break;
            default:
                label = 'غير معروف';
                break;
        }
        
        if (isMe) {
            bubbleColor = 'bg-primary text-white';
            label = 'أنت';
        }
        
        return { label, icon, bubbleColor, align };
    };

    if (isLoading) return <PageLoader />;
    
    // Safety check for journey data presence
    if (!journeyData || !journeyData.booking) {
        return <ErrorState message="الرحلة غير موجودة أو لم يتم تحميل البيانات." />;
    }

    const { booking, scheduledSessions, messages, attachments, childProfile } = journeyData;
    const instructorName = (journeyData as any).instructor?.name || 'غير محدد';
    const bookingPackageName = (booking as any).package_name || 'باقة تدريبية';
    
    // استخراج المسودة المحفوظة من تفاصيل الحجز
    const savedDraft = (booking as any).details?.draft;

    return (
        <div className="bg-muted/40 py-10 animate-fadeIn min-h-screen">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <Link to={currentUser?.role === 'student' ? "/student/dashboard" : "/account"} className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
                         <ArrowLeft size={12} className="rotate-180"/> العودة
                    </Link>
                    <h1 className="text-3xl font-black text-gray-800">{bookingPackageName}</h1>
                    <p className="text-muted-foreground font-medium">الطالب: {childProfile?.name} | المدرب: {instructorName}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* الجانب الأيمن: منطقة العمل */}
                    <div className="lg:col-span-3">
                        <Card className="min-h-[650px] flex flex-col shadow-lg border-t-4 border-t-primary">
                            <CardContent className="pt-6 flex-grow flex flex-col">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-grow flex flex-col">
                                    <TabsList className="mb-6 w-full justify-start border-b rounded-none bg-transparent p-0 gap-6">
                                        <TabsTrigger value="draft" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3"><Edit3 size={16} className="ml-2"/> مسودة القصة</TabsTrigger>
                                        <TabsTrigger value="discussion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3"><MessageSquare size={16} className="ml-2"/> المحادثة المباشرة</TabsTrigger>
                                        <TabsTrigger value="attachments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3"><Paperclip size={16} className="ml-2"/> ملفات ومرفقات</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="draft" className="flex-grow h-full">
                                        <WritingDraftPanel journeyId={booking.id} canInteract={true} initialDraft={savedDraft} />
                                    </TabsContent>

                                    <TabsContent value="discussion" className="flex-grow flex flex-col h-[500px]">
                                        <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-xl border">
                                            {messages.length > 0 ? messages.map((msg: any) => {
                                                const { label, icon, bubbleColor, align } = getSenderInfo(msg.sender_role, msg.sender_id);
                                                const isMe = msg.sender_id === currentUser?.id;
                                                
                                                return (
                                                    <div key={msg.id} className={`flex ${align}`}>
                                                        <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm border ${bubbleColor} ${isMe ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                                                            <div className="flex justify-between items-center mb-1 gap-4 border-b border-black/5 pb-1">
                                                                <div className="flex items-center gap-1 text-[10px] font-bold opacity-90">
                                                                    {icon} {label}
                                                                </div>
                                                                <p className="text-[9px] opacity-60" dir="ltr">{new Date(msg.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</p>
                                                            </div>
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap pt-1">{msg.message_text}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                    <MessageSquare size={48} className="opacity-20 mb-2"/>
                                                    <p>لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                            <Textarea 
                                                value={newMessage} 
                                                onChange={e => setNewMessage(e.target.value)} 
                                                placeholder="اكتب رسالتك هنا... (Shift+Enter لسطر جديد)" 
                                                className="min-h-[50px] max-h-[100px]" 
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                            />
                                            <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={sendSessionMessage.isPending || !newMessage.trim()}>
                                                {sendSessionMessage.isPending ? <Loader2 className="animate-spin" /> : <Send size={20}/>}
                                            </Button>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="attachments">
                                        <div className="space-y-6">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-blue-900">مشاركة الملفات</h3>
                                                    <p className="text-xs text-blue-700 mt-1">يمكنك رفع صور أو مستندات (PDF, Word) لمشاركتها مع المدرب.</p>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef}
                                                        className="hidden" 
                                                        onChange={handleFileUpload} 
                                                        disabled={uploadSessionAttachment.isPending} 
                                                        id="file-upload"
                                                    />
                                                    <Button 
                                                        as="label" 
                                                        htmlFor="file-upload" 
                                                        loading={uploadSessionAttachment.isPending} 
                                                        icon={!uploadSessionAttachment.isPending ? <Upload size={16}/> : undefined}
                                                        className="cursor-pointer"
                                                    >
                                                        {uploadSessionAttachment.isPending ? 'جاري الرفع...' : 'رفع ملف'}
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {attachments.length > 0 ? attachments.map((att: any) => {
                                                    const roleMap: Record<string, string> = {
                                                        student: 'الطالب', instructor: 'المدرب', user: 'ولي الأمر', parent: 'ولي الأمر', super_admin: 'الإدارة'
                                                    };
                                                    const uploaderLabel = roleMap[att.uploader_role] || 'مستخدم';
                                                    
                                                    return (
                                                        <div key={att.id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                                                    <FileText size={20}/>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold truncate text-gray-800" title={att.file_name}>{att.file_name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        بواسطة: {uploaderLabel} • {formatDate(att.created_at)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <a 
                                                                href={att.file_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                                title="تحميل الملف"
                                                            >
                                                                <Download size={18}/>
                                                            </a>
                                                        </div>
                                                    )
                                                }) : (
                                                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                                                        <Paperclip className="mx-auto h-12 w-12 opacity-20 mb-2" />
                                                        <p>لا توجد ملفات مرفوعة بعد.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* الجانب الأيسر: الجدول الزمني */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg border-t-4 border-t-secondary">
                            <CardHeader className="pb-3 border-b bg-gray-50/50"><CardTitle className="text-lg font-bold">الجدول الزمني</CardTitle></CardHeader>
                            <CardContent className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                                {scheduledSessions.map((s: any, idx: number) => {
                                    const isCompleted = s.status === 'completed';
                                    const isUpcoming = s.status === 'upcoming';
                                    return (
                                        <div key={s.id} className={`p-3 rounded-xl border relative overflow-hidden ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                            {isCompleted && <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-br-lg">مكتمل</div>}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-black text-gray-500 bg-gray-100 px-2 py-1 rounded">#{idx + 1}</span>
                                                <span className="text-xs font-bold text-gray-700">{formatDate(s.session_date)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                                                    {new Date(s.session_date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                                {/* عرض زر الدخول للطالب أو ولي الأمر أو المدرب أو المشرف */}
                                                {isUpcoming && currentUser && (['student', 'parent', 'instructor', 'super_admin', 'creative_writing_supervisor'].includes(currentUser.role)) && (
                                                    <Button as={Link} to={`/session/${s.id}`} size="sm" className="h-7 text-[10px] px-3" icon={<ArrowLeft size={12}/>}>دخول</Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingJourneyPage;
