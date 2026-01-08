
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    CheckCircle, PlayCircle, Edit3, XCircle, ArrowLeft, Download, User
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { supabase } from '../lib/supabaseClient';

const TrainingJourneyPage: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { data: journeyData, isLoading, refetch } = useTrainingJourneyData(journeyId);
    const { sendSessionMessage, uploadSessionAttachment } = useBookingMutations();

    const [activeTab, setActiveTab] = useState<'draft' | 'discussion' | 'attachments'>('draft');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const isInstructor = currentUser?.role === 'instructor';

    // التمرير لأسفل المحادثة تلقائياً
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [journeyData?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !journeyId || !currentUser) return;
        
        await sendSessionMessage.mutateAsync({
            bookingId: journeyId,
            senderId: currentUser.id,
            role: currentUser.role as any,
            message: newMessage
        });
        setNewMessage('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !journeyId || !currentUser) return;

        await uploadSessionAttachment.mutateAsync({
            bookingId: journeyId,
            uploaderId: currentUser.id,
            role: currentUser.role as any,
            file
        });
    };

    if (isLoading) return <PageLoader />;
    
    // Safety check for journey data presence
    if (!journeyData || !journeyData.booking) {
        return <ErrorState message="الرحلة غير موجودة أو لم يتم تحميل البيانات." />;
    }

    const { booking, scheduledSessions, messages, attachments, childProfile } = journeyData;
    // Safe access using any to bypass strict type checking if needed for dynamic properties
    const instructorName = (journeyData as any).instructor?.name || 'غير محدد';
    const bookingPackageName = (booking as any).package_name || 'باقة تدريبية';

    return (
        <div className="bg-muted/40 py-10 animate-fadeIn min-h-screen">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <Link to="/account" className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
                         <ArrowLeft size={12} className="rotate-180"/> العودة لحسابي
                    </Link>
                    <h1 className="text-3xl font-black text-gray-800">{bookingPackageName}</h1>
                    <p className="text-muted-foreground font-medium">الطالب: {childProfile?.name} | المدرب: {instructorName}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* الجانب الأيمن: منطقة العمل */}
                    <div className="lg:col-span-3">
                        <Card className="min-h-[600px] flex flex-col">
                            <CardContent className="pt-6 flex-grow flex flex-col">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-grow flex flex-col">
                                    <TabsList className="mb-6">
                                        <TabsTrigger value="draft"><Edit3 size={16}/> مسودة القصة</TabsTrigger>
                                        <TabsTrigger value="discussion"><MessageSquare size={16}/> المحادثة المباشرة</TabsTrigger>
                                        <TabsTrigger value="attachments"><Paperclip size={16}/> تبادل الملفات</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="draft" className="flex-grow">
                                        <WritingDraftPanel journeyId={booking.id} canInteract={true} />
                                    </TabsContent>

                                    <TabsContent value="discussion" className="flex-grow flex flex-col h-[500px]">
                                        <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-xl">
                                            {messages.length > 0 ? messages.map((msg: any) => (
                                                <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.sender_id === currentUser?.id ? 'bg-primary text-white rounded-tl-none' : 'bg-white text-gray-800 rounded-tr-none border'}`}>
                                                        <p className="text-xs opacity-70 mb-1 font-bold">{msg.sender_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                                                        <p className="text-sm leading-relaxed">{msg.message_text}</p>
                                                        <p className="text-[9px] mt-1 opacity-50 text-left">{new Date(msg.created_at).toLocaleTimeString('ar-EG')}</p>
                                                    </div>
                                                </div>
                                            )) : <p className="text-center text-muted-foreground py-10 italic">ابدأ المحادثة مع مدربك هنا...</p>}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <Textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="اكتب رسالتك هنا..." className="min-h-[50px]" />
                                            <Button type="submit" size="icon" className="h-full px-6" disabled={sendSessionMessage.isPending}><Send size={20}/></Button>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="attachments">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-bold text-gray-700">الملفات المشتركة</h3>
                                                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                                    <Upload size={16}/> رفع ملف جديد
                                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadSessionAttachment.isPending} />
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {attachments.length > 0 ? attachments.map((att: any) => (
                                                    <Card key={att.id} className="bg-gray-50 border-dashed">
                                                        <CardContent className="p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="text-blue-500"/>
                                                                <div>
                                                                    <p className="text-sm font-bold truncate max-w-[150px]">{att.file_name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{formatDate(att.created_at)}</p>
                                                                </div>
                                                            </div>
                                                            <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 transition-colors">
                                                                <Download size={18}/>
                                                            </a>
                                                        </CardContent>
                                                    </Card>
                                                )) : <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">لا توجد ملفات مرفوعة بعد.</div>}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* الجانب الأيسر: الجدول الزمني */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader className="pb-2 border-b"><CardTitle className="text-sm font-bold">الجدول الزمني</CardTitle></CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {scheduledSessions.map((s: any, idx: number) => (
                                    <div key={s.id} className={`p-3 rounded-xl border ${s.status === 'completed' ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
                                        <div className="flex justify-between text-[10px] font-black mb-1">
                                            <span>الجلسة {idx + 1}</span>
                                            {s.status === 'completed' ? <CheckCircle size={12} className="text-green-600"/> : <span className="text-blue-600">قادمة</span>}
                                        </div>
                                        <p className="text-xs font-bold">{formatDate(s.session_date)}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(s.session_date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</p>
                                        {s.status === 'upcoming' && (
                                            <Button as={Link} to={`/session/${s.id}`} size="sm" className="w-full mt-3 h-8 text-[10px] font-bold" icon={<PlayCircle size={14}/>}>انضم للجلسة</Button>
                                        )}
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
