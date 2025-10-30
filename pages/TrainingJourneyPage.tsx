import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrainingJourneyData } from '../hooks/queries/user/useJourneyDataQuery';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import PageLoader from '../components/ui/PageLoader';
import WritingDraftPanel from '../components/student/WritingDraftPanel'; // Import new panel
import { MessageSquare, Paperclip, FileText, Target, Award, Calendar, Clock, User, Video, CheckCircle, AlertTriangle, X, Send, Upload, Save, Sparkles, FileCheck2, BookUp, ArrowLeft, PenSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';
import type { SessionAttachment } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

const DiscussionSection: React.FC<{ messages: any[]; journeyId: string; canInteract: boolean }> = ({ messages, journeyId, canInteract }) => {
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        // Mock sending message
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
        // Mock uploading file
        console.log('Uploading file:', { journeyId, file: file.name });
        setFile(null);
        // Clear the file input
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
                    placeholder="اكتب ملاحظاتك حول تقدم الطالب هنا..."
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
                <p className="text-foreground bg-muted p-4 rounded-lg border whitespace-pre-wrap">{notes}</p>
            ) : (
                <p className="text-muted-foreground text-center py-4">لا توجد ملاحظات من المدرب بعد.</p>
            )}
        </div>
    );
};

const AdvancedOpportunities: React.FC<{ onOrderService: (serviceName: string) => void }> = ({ onOrderService }) => (
    <div className="mt-6 border-t pt-4">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" />
            خطوتك التالية
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
            لقد أظهرت تقدماً رائعاً! الآن يمكنك الانتقال بإبداعك إلى مستوى جديد.
        </p>
        <div className="space-y-3">
            <Button 
                className="w-full justify-between text-left h-auto py-2" 
                variant="outline" 
                onClick={() => onOrderService('المشاركة في الإصدار القادم')}>
                <div className="flex items-center gap-3">
                    <Award size={20} className="text-yellow-600"/>
                    <div>
                        <p className="font-semibold">المشاركة في الإصدار القادم</p>
                        <p className="text-xs font-normal text-muted-foreground">انشر قصتك في كتابنا المجمع</p>
                    </div>
                </div>
                <ArrowLeft size={16} />
            </Button>
            <Button 
                className="w-full justify-between text-left h-auto py-2" 
                variant="outline" 
                onClick={() => onOrderService('طلب إصدار خاص')}>
                <div className="flex items-center gap-3">
                    <BookUp size={20} className="text-green-600"/>
                    <div>
                        <p className="font-semibold">طلب إصدار خاص</p>
                        <p className="text-xs font-normal text-muted-foreground">حوّل قصتك إلى كتاب مطبوع</p>
                    </div>
                </div>
                 <ArrowLeft size={16} />
            </Button>
        </div>
    </div>
);


const TrainingJourneyPage: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const { currentUser, childProfiles } = useAuth();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    const { data, isLoading, error } = useTrainingJourneyData(journeyId);
    const { updateBookingProgressNotes } = useBookingMutations();
    
    const [activeTab, setActiveTab] = useState<'draft' |'discussion' | 'attachments' | 'notes'>('draft');
    const [notesContent, setNotesContent] = useState('');

    React.useEffect(() => {
        if(data?.booking?.progress_notes) {
            setNotesContent(data.booking.progress_notes);
        }
    }, [data]);
    
    const canInteract = currentUser?.role === 'student' || currentUser?.role === 'instructor' || currentUser?.role === 'user';
    const isInstructor = currentUser?.role === 'instructor';
    const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'user';

    const childName = useMemo(() => {
        if (!data) return '';
        const child = childProfiles.find(c => c.id === data.booking.child_id);
        return child?.name || '';
    }, [data, childProfiles]);

    const allSessions = useMemo(() => {
        if (!data) return { upcoming: [], past: [] };

        const scheduled = data.scheduledSessions.map(s => ({ ...s, isSupport: false }));
        const support = data.approvedSupportSessions.map(s => ({
            id: `support-${s.id}`,
            session_date: s.requested_at, // Use requested_at as a placeholder date
            status: 'upcoming',
            isSupport: true,
            child_id: s.child_id,
            instructor_id: s.instructor_id,
        }));
        
        const combined = [...scheduled, ...support];

        const upcoming = combined
            .filter(s => s.status === 'upcoming')
            .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
            
        const past = combined
            .filter(s => s.status !== 'upcoming')
            .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.date).getTime());

        return { upcoming, past };

    }, [data]);
    
    const completedSessionsCount = useMemo(() => {
        if (!data) return 0;
        return data.scheduledSessions.filter(s => s.status === 'completed').length;
    }, [data]);


    if (isLoading) return <PageLoader text="جاري تحميل رحلتك التدريبية..." />;
    if (error || !data) return <div className="text-center text-red-500 py-20">{error?.message || 'لم يتم العثور على الرحلة.'}</div>;

    const { booking, package: pkg, instructor, messages, attachments, additionalServices } = data;

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
            type: 'order', // Using 'order' as a generic type for one-off purchases
            payload: {
                productKey: `service_${service.id}`,
                summary,
                totalPrice: service.price,
                // Add context for admins
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

    const workspaceTabs = [
        { key: 'draft', label: 'مسودة الكتابة', icon: <PenSquare size={16} /> },
        { key: 'discussion', label: 'النقاش', icon: <MessageSquare size={16} /> },
        { key: 'attachments', label: 'المرفقات', icon: <Paperclip size={16} /> },
        { key: 'notes', label: 'ملاحظات المدرب', icon: <FileText size={16} /> },
    ];
    
    return (
        <div className="bg-muted/50 py-12">
            <div className="container mx-auto px-4">
                 <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-3xl">{pkg?.name || booking.package_name}</CardTitle>
                        <CardDescription>مع المدرب: {instructor?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {pkg?.goal_description && <p className="flex items-start gap-3"><Target className="text-primary mt-1 flex-shrink-0"/><span><strong className="font-semibold">الهدف:</strong> {pkg.goal_description}</span></p>}
                        {pkg?.final_product_description && <p className="flex items-start gap-3"><Award className="text-green-500 mt-1 flex-shrink-0"/><span><strong className="font-semibold">المنتج النهائي:</strong> {pkg.final_product_description}</span></p>}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                                <TabsList>
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
                    
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calendar /> الجلسات</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold text-muted-foreground mb-2 text-sm">القادمة</h3>
                                {allSessions.upcoming.length > 0 ? (
                                    <div className="space-y-3">
                                        {allSessions.upcoming.map((s: any) => (
                                            <div key={s.id} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-sm flex items-center gap-2">{s.isSupport ? <><AlertTriangle size={14} className="text-orange-500"/> جلسة دعم (15 د)</> : <><Clock size={14}/> {new Date(s.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</>}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(s.session_date)}</p>
                                                </div>
                                                {!s.isSupport && <Button asChild size="sm" variant="success"><Link to={`/session/${s.id}`}><Video size={14}/> انضم</Link></Button>}
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground text-center py-2">لا توجد جلسات قادمة.</p>}

                                <h3 className="font-semibold text-muted-foreground mb-2 mt-6 border-t pt-4 text-sm">السابقة</h3>
                                {allSessions.past.length > 0 ? (
                                    <div className="space-y-2">
                                    {allSessions.past.map((s: any) => (
                                        <div key={s.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {s.status === 'completed' ? <CheckCircle size={14} className="text-green-500"/> : <X size={14} className="text-destructive"/>}
                                            <span>{formatDate(s.session_date)}</span>
                                        </div>
                                    ))}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground text-center py-2">لا توجد جلسات سابقة.</p>}
                                
                                {canInteract && (
                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Sparkles /> خدمات سريعة</h3>
                                        <Button className="w-full" variant="outline" onClick={() => handleOrderService('استشارة خاصة')}>
                                            اطلب جلسة استشارية خاصة
                                        </Button>
                                    </div>
                                )}
                                
                                {completedSessionsCount >= 8 && canInteract && (
                                    <AdvancedOpportunities onOrderService={handleOrderService} />
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