import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { useTrainingJourneyData } from '../hooks/queries/user/useJourneyDataQuery';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import PageLoader from '../components/ui/PageLoader';
import { MessageSquare, Paperclip, FileText, Target, Award, Calendar, Clock, User, Video, CheckCircle, AlertTriangle, X, Send, Upload, Save, Sparkles, FileCheck2, BookUp, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';
import type { SessionAttachment } from '../lib/database.types';

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
        <div className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_role === 'instructor' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender_role === 'instructor' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                            <p className="text-sm font-bold">{msg.sender_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                            <p className="text-gray-800">{msg.message_text}</p>
                            <p className="text-xs text-gray-400 mt-1 text-left">{new Date(msg.created_at).toLocaleTimeString('ar-EG')}</p>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">لا توجد رسائل بعد. ابدأ النقاش!</p>}
            </div>
            {canInteract && (
                <div className="pt-4 border-t">
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
        <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto p-2">
                {attachments.length > 0 ? attachments.map(att => (
                    <div key={att.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                             <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <Paperclip className="text-gray-500" />
                                <div>
                                    <p className="font-semibold text-blue-600">{att.file_name}</p>
                                    <p className="text-xs text-gray-500">تم الرفع بواسطة {att.uploader_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                                </div>
                            </a>
                            {isStudentOrParent && att.uploader_role === 'student' && (
                                <Button size="sm" variant="outline" onClick={() => onOrderReview(att)} icon={<FileCheck2 size={16} />}>
                                    اطلب مراجعة
                                </Button>
                            )}
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">لا توجد مرفقات.</p>}
            </div>
            {canInteract && (
                <div className="pt-4 border-t">
                     <input type="file" id="file-upload" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"/>
                     <Button variant="outline" className="w-full" onClick={handleUpload} disabled={!file} icon={<Upload size={16} />}>رفع ملف جديد</Button>
                </div>
            )}
        </div>
    );
};

const NotesSection: React.FC<{ 
    notes: string;
    isInstructor: boolean;
    onNotesChange: (notes: string | ((prev: string) => string)) => void;
    onSave: () => void;
    isSaving: boolean;
    generationContext: any;
}> = ({ notes, isInstructor, onNotesChange, onSave, isSaving, generationContext }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { addToast } = useToast();

    const generateNotes = async () => {
        setIsGenerating(true);
        onNotesChange(''); // Clear previous notes

        const { childName, instructor, pkg, completedSessionsCount, messages, attachments } = generationContext;
        
        const prompt = `
            أنت مدرب كتابة إبداعية خبير ومحترف. مهمتك هي كتابة تقرير تقدم موجز ومحفز للطالب بناءً على معلومات الجلسة.

            معلومات الجلسة:
            - اسم الطالب: ${childName}
            - اسم المدرب: ${instructor?.name}
            - اسم الباقة: ${pkg?.name}
            - هدف الباقة: ${pkg?.goal_description}
            - الجلسات المكتملة: ${completedSessionsCount} من أصل ${pkg?.sessions.match(/\d+/)?.[0]}

            الأنشطة الأخيرة:
            - آخر الرسائل: ${messages.slice(-2).map((m: any) => `${m.sender_role}: ${m.message_text}`).join('\n') || 'لا يوجد'}
            - آخر المرفقات: ${attachments.slice(-2).map((a: any) => a.file_name).join(', ') || 'لا يوجد'}

            المطلوب:
            اكتب مسودة لملاحظات التقدم في حدود 70-100 كلمة باللغة العربية. يجب أن تكون الملاحظات:
            1. إيجابية ومحفزة.
            2. تشير إلى تقدم الطالب بناءً على الأنشطة إن وجدت.
            3. تقترح خطوة تالية بسيطة أو سؤالاً لتشجيع الطالب.
            4. موجهة للطالب وولي أمره.
        `;

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            for await (const chunk of responseStream) {
                onNotesChange(prev => prev + chunk.text);
            }
            
        } catch (e) {
            console.error("Gemini API error:", e);
            addToast('عفواً، حدث خطأ أثناء توليد الأفكار. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };


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
                     <Button variant="outline" onClick={generateNotes} loading={isGenerating} icon={<Sparkles />}>
                        اقترح ملاحظات (AI)
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {notes ? (
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">{notes}</p>
            ) : (
                <p className="text-gray-500 text-center py-4">لا توجد ملاحظات من المدرب بعد.</p>
            )}
        </div>
    );
};

const AdvancedOpportunities: React.FC<{ onOrderService: (serviceName: string) => void }> = ({ onOrderService }) => (
    <div className="mt-6 border-t pt-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" />
            خطوتك التالية
        </h3>
        <p className="text-sm text-gray-600 mb-4">
            لقد أظهرت تقدماً رائعاً! الآن يمكنك الانتقال بإبداعك إلى مستوى جديد.
        </p>
        <div className="space-y-3">
            <Button 
                className="w-full justify-between text-left h-auto py-2" 
                variant="subtle" 
                onClick={() => onOrderService('المشاركة في الإصدار القادم')}>
                <div className="flex items-center gap-3">
                    <Award size={20} className="text-yellow-600"/>
                    <div>
                        <p className="font-semibold">المشاركة في الإصدار القادم</p>
                        <p className="text-xs font-normal text-gray-500">انشر قصتك في كتابنا المجمع</p>
                    </div>
                </div>
                <ArrowLeft size={16} />
            </Button>
            <Button 
                className="w-full justify-between text-left h-auto py-2" 
                variant="subtle" 
                onClick={() => onOrderService('طلب إصدار خاص')}>
                <div className="flex items-center gap-3">
                    <BookUp size={20} className="text-green-600"/>
                    <div>
                        <p className="font-semibold">طلب إصدار خاص</p>
                        <p className="text-xs font-normal text-gray-500">حوّل قصتك إلى كتاب مطبوع</p>
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
    
    const [activeTab, setActiveTab] = useState<'discussion' | 'attachments' | 'notes'>('discussion');
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
        { key: 'discussion', label: 'النقاش', icon: <MessageSquare /> },
        { key: 'attachments', label: 'المرفقات', icon: <Paperclip /> },
        { key: 'notes', label: 'ملاحظات المدرب', icon: <FileText /> },
    ];
    
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Journey Header */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h1 className="text-3xl font-bold mb-2">{pkg?.name || booking.package_name}</h1>
                <p className="text-gray-500">مع المدرب: {instructor?.name}</p>
                <div className="mt-4 space-y-3">
                    {pkg?.goal_description && <p className="flex items-start gap-3 text-sm"><Target className="text-blue-500 mt-1 flex-shrink-0"/><span><strong className="font-bold">الهدف:</strong> {pkg.goal_description}</span></p>}
                    {pkg?.final_product_description && <p className="flex items-start gap-3 text-sm"><Award className="text-green-500 mt-1 flex-shrink-0"/><span><strong className="font-bold">المنتج النهائي:</strong> {pkg.final_product_description}</span></p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Workspace */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                    <div className="border-b mb-4">
                        <nav className="-mb-px flex space-x-6 rtl:space-x-reverse">
                            {workspaceTabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    {activeTab === 'discussion' && <DiscussionSection messages={messages} journeyId={booking.id} canInteract={canInteract} />}
                    {activeTab === 'attachments' && <AttachmentsSection attachments={attachments} journeyId={booking.id} canInteract={canInteract} isStudentOrParent={isStudentOrParent} onOrderReview={(att) => handleOrderService('مراجعة نص', { attachmentId: att.id, fileName: att.file_name })} />}
                    {activeTab === 'notes' && (
                        <NotesSection 
                            notes={notesContent}
                            isInstructor={isInstructor}
                            onNotesChange={setNotesContent}
                            onSave={handleSaveNotes}
                            isSaving={updateBookingProgressNotes.isPending}
                            generationContext={{ childName, instructor, pkg, completedSessionsCount, messages, attachments }}
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar /> الجلسات</h2>
                        <h3 className="font-semibold text-gray-600 mb-2">القادمة</h3>
                        {allSessions.upcoming.length > 0 ? (
                            <div className="space-y-3">
                                {allSessions.upcoming.map((s: any) => (
                                    <div key={s.id} className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-sm flex items-center gap-2">{s.isSupport ? <><AlertTriangle size={14} className="text-orange-500"/> جلسة دعم (15 د)</> : <><Clock size={14}/> {new Date(s.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</>}</p>
                                            <p className="text-xs text-gray-500">{formatDate(s.session_date)}</p>
                                        </div>
                                        {!s.isSupport && <Button asChild size="sm" variant="success"><Link to={`/session/${s.id}`}><Video size={14}/> انضم</Link></Button>}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500 text-center py-2">لا توجد جلسات قادمة.</p>}

                        <h3 className="font-semibold text-gray-600 mb-2 mt-6 border-t pt-4">السابقة</h3>
                        {allSessions.past.length > 0 ? (
                            <div className="space-y-2">
                               {allSessions.past.map((s: any) => (
                                   <div key={s.id} className="flex items-center gap-2 text-sm text-gray-500">
                                       {s.status === 'completed' ? <CheckCircle size={14} className="text-green-500"/> : <X size={14} className="text-red-500"/>}
                                       <span>{formatDate(s.session_date)}</span>
                                   </div>
                               ))}
                            </div>
                        ) : <p className="text-sm text-gray-500 text-center py-2">لا توجد جلسات سابقة.</p>}
                        
                        {canInteract && (
                             <div className="mt-6 border-t pt-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Sparkles /> خدمات سريعة</h3>
                                <Button className="w-full" variant="outline" onClick={() => handleOrderService('استشارة خاصة')}>
                                    اطلب جلسة استشارية خاصة
                                </Button>
                            </div>
                        )}
                        
                        {completedSessionsCount >= 8 && canInteract && (
                            <AdvancedOpportunities onOrderService={handleOrderService} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingJourneyPage;