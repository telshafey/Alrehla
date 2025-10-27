import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrainingJourneyData } from '../hooks/userQueries';
import PageLoader from '../components/ui/PageLoader';
// FIX: Import 'X' icon from 'lucide-react'
import { MessageSquare, Paperclip, FileText, Target, Award, Calendar, Clock, User, Video, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { formatDate } from '../utils/helpers';

const DiscussionSection: React.FC<{ messages: any[] }> = ({ messages }) => (
    <div className="space-y-4">
        {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_role === 'instructor' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-3 rounded-lg max-w-lg ${msg.sender_role === 'instructor' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    <p className="text-sm font-bold">{msg.sender_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                    <p className="text-gray-800">{msg.message_text}</p>
                    <p className="text-xs text-gray-400 mt-1 text-left">{new Date(msg.created_at).toLocaleTimeString('ar-EG')}</p>
                </div>
            </div>
        ))}
        <div className="pt-4 border-t">
            <Textarea placeholder="اكتب رسالتك هنا..." rows={3} />
            <Button className="mt-2">إرسال</Button>
        </div>
    </div>
);

const AttachmentsSection: React.FC<{ attachments: any[] }> = ({ attachments }) => (
    <div className="space-y-2">
        {attachments.length > 0 ? attachments.map(att => (
            <a href={att.file_url} target="_blank" rel="noopener noreferrer" key={att.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Paperclip className="text-gray-500" />
                <div>
                    <p className="font-semibold text-blue-600">{att.file_name}</p>
                    <p className="text-xs text-gray-500">تم الرفع بواسطة {att.uploader_role === 'instructor' ? 'المدرب' : 'الطالب'}</p>
                </div>
            </a>
        )) : <p className="text-gray-500 text-center py-4">لا توجد مرفقات.</p>}
         <Button variant="outline" className="mt-4 w-full">رفع ملف جديد</Button>
    </div>
);

const NotesSection: React.FC<{ notes: string | null }> = ({ notes }) => (
     <div>
        {notes ? (
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">{notes}</p>
        ) : (
            <p className="text-gray-500 text-center py-4">لا توجد ملاحظات من المدرب بعد.</p>
        )}
    </div>
);

const TrainingJourneyPage: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const { data, isLoading, error } = useTrainingJourneyData(journeyId);
    const [activeTab, setActiveTab] = useState<'discussion' | 'attachments' | 'notes'>('discussion');

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
            .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

        return { upcoming, past };

    }, [data]);


    if (isLoading) return <PageLoader text="جاري تحميل رحلتك التدريبية..." />;
    if (error || !data) return <div className="text-center text-red-500 py-20">{error?.message || 'لم يتم العثور على الرحلة.'}</div>;

    const { booking, package: pkg, instructor, messages, attachments } = data;

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
                    {activeTab === 'discussion' && <DiscussionSection messages={messages} />}
                    {activeTab === 'attachments' && <AttachmentsSection attachments={attachments} />}
                    {activeTab === 'notes' && <NotesSection notes={booking.progress_notes} />}
                </div>

                {/* Sessions Sidebar */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingJourneyPage;