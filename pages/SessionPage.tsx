
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSessionDetails } from '../hooks/queries/user/useJourneyDataQuery';
import { useAdminJitsiSettings } from '../hooks/queries/admin/useAdminSettingsQuery';
import { 
    Loader2, ShieldAlert, Clock, CheckCircle, Headphones, 
    Video, Wind, Sparkles, LogOut, Save, MessageSquare 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
// Added FormField import to fix missing name error
import FormField from '../components/ui/FormField';
import { bookingService } from '../services/bookingService';
import { useToast } from '../contexts/ToastContext';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const CountdownTimer: React.FC<{ targetDate: Date; onComplete: () => void }> = ({ targetDate, onComplete }) => {
    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (+targetDate - +new Date() <= 0) {
                onComplete();
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const timerComponents = [
        timeLeft.days > 0 && `${timeLeft.days} يوم`,
        timeLeft.hours > 0 && `${timeLeft.hours} ساعة`,
        `${timeLeft.minutes} دقيقة`,
        `${timeLeft.seconds} ثانية`,
    ].filter(Boolean).join(' و ');

    return <p className="text-xl sm:text-2xl font-bold text-primary">{timerComponents}</p>;
};

const SessionPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { currentUser, loading: authLoading } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const { data: session, isLoading: sessionLoading, refetch } = useSessionDetails(sessionId);
    const { data: jitsiSettings, isLoading: settingsLoading } = useAdminJitsiSettings();
    
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    
    const [status, setStatus] = useState<'loading' | 'waiting' | 'active' | 'ended' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [joinTime, setJoinTime] = useState<Date | null>(null);
    const [jitsiScriptLoaded, setJitsiScriptLoaded] = useState(false);
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [finishNotes, setFinishNotes] = useState('');
    const [isSubmittingFinish, setIsSubmittingFinish] = useState(false);

    const isInstructor = currentUser?.role === 'instructor';

    // 1. Load Jitsi Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => setJitsiScriptLoaded(true);
        document.head.appendChild(script);
        return () => { if (document.head.contains(script)) { document.head.removeChild(script); } };
    }, []);

    // 2. Validate Session & State
    useEffect(() => {
        if (authLoading || sessionLoading || settingsLoading) return;

        if (!currentUser) {
            navigate('/account');
            return;
        }

        if (!session) {
            setError('لم يتم العثور على تفاصيل الجلسة.');
            setStatus('error');
            return;
        }
        
        if (session.status === 'completed' || session.status === 'missed') {
            setStatus('ended');
            return;
        }

        const startTime = new Date(session.session_date);
        const joinMinutesBefore = jitsiSettings?.join_minutes_before ?? 10;
        const calculatedJoinTime = new Date(startTime.getTime() - joinMinutesBefore * 60000);
        const now = new Date();

        setJoinTime(calculatedJoinTime);

        if (now < calculatedJoinTime) {
            setStatus('waiting');
        } else {
            setStatus('active');
        }

    }, [authLoading, sessionLoading, settingsLoading, currentUser, session, jitsiSettings, navigate]);

    // 3. Initialize Jitsi
    useEffect(() => {
        if (status !== 'active' || !jitsiScriptLoaded || !jitsiSettings || !session || !currentUser || jitsiApiRef.current) {
            return;
        }

        const initializeJitsi = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach(track => track.stop());
            } catch (err: any) {
                setError("يرجى السماح بالوصول إلى الكاميرا والميكروفون للانضمام.");
                setStatus('error');
                return;
            }

            if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
                try {
                    const options = {
                        roomName: `${jitsiSettings.room_prefix}${session.id}`,
                        width: '100%',
                        height: '100%',
                        parentNode: jitsiContainerRef.current,
                        userInfo: { displayName: currentUser.name || currentUser.email },
                        configOverwrite: {
                            prejoinPageEnabled: false,
                            startWithAudioMuted: jitsiSettings.start_with_audio_muted,
                            startWithVideoMuted: jitsiSettings.start_with_video_muted,
                        },
                        interfaceConfigOverwrite: {
                            SHOW_JITSI_WATERMARK: false,
                            SHOW_WATERMARK_FOR_GUESTS: false,
                            TOOLBAR_BUTTONS: [
                                'microphone', 'camera', 'desktop', 'fullscreen', 
                                'fodeviceselection', 'hangup', 'profile', 'chat', 
                                'settings', 'tileview'
                            ],
                        },
                    };

                    jitsiApiRef.current = new window.JitsiMeetExternalAPI(jitsiSettings.domain, options);
                    
                    // Listen for hangup
                    jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
                        if (!isInstructor) {
                            navigate(-1);
                        }
                    });

                } catch (e) {
                    setError("فشل تحميل مكون الفيديو.");
                    setStatus('error');
                }
            }
        };

        initializeJitsi();

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
        };
    }, [status, currentUser, session, jitsiSettings, jitsiScriptLoaded, isInstructor, navigate]);

    const handleFinishSession = async () => {
        if (!sessionId) return;
        setIsSubmittingFinish(true);
        try {
            await bookingService.updateScheduledSession(sessionId, { 
                status: 'completed', 
                notes: finishNotes 
            });
            addToast('تم إنهاء الجلسة بنجاح وتوثيقها.', 'success');
            navigate(`/journey/${session.booking_id}`);
        } catch (e) {
            addToast('حدث خطأ أثناء إنهاء الجلسة.', 'error');
        } finally {
            setIsSubmittingFinish(false);
        }
    };

    const renderContent = () => {
        if (status === 'loading') return (
            <div className="flex flex-col justify-center items-center h-full">
                <Loader2 className="animate-spin h-12 w-12 text-white" />
                <p className="mt-4 text-gray-300">جاري تجهيز الغرفة...</p>
            </div>
        );

        if (status === 'waiting') return (
            <div className="flex flex-col justify-center items-center h-full text-white text-center p-4 bg-slate-900">
                <Card className="max-w-lg w-full">
                    <CardHeader>
                        <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="text-2xl">الجلسة لم تبدأ بعد</CardTitle>
                        <CardDescription>موعد البدء:</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {joinTime && <CountdownTimer targetDate={joinTime} onComplete={() => setStatus('active')} />}
                        <div className="text-right border-t pt-4 space-y-2">
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2"><Wind size={14}/> تأكد من الهدوء حولك.</p>
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2"><Headphones size={14}/> استخدم سماعات الأذن لتركيز أفضل.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );

        if (status === 'ended') return (
            <div className="flex flex-col justify-center items-center h-full text-white text-center p-4 bg-slate-900">
                <CheckCircle className="h-20 w-20 text-green-400 mb-6" />
                <h2 className="text-3xl font-black mb-2">انتهت هذه الجلسة</h2>
                <p className="max-w-md text-gray-400 mb-8">تم إغلاق القاعة وتوثيق الحضور. يمكنك العودة لمتابعة رحلتك التعليمية.</p>
                <Button as={Link} to="/account">العودة لحسابي</Button>
            </div>
        );

        if (status === 'error') return (
             <div className="flex flex-col justify-center items-center h-full text-white text-center p-4">
                <ShieldAlert className="h-16 w-16 text-red-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">تعذر الدخول</h2>
                <p className="max-w-md text-gray-400 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>تحديث الصفحة</Button>
            </div>
        );

        return null;
    };

    return (
        <div className="w-full h-screen bg-black flex flex-col overflow-hidden">
            {/* Instructor Controls Header */}
            {status === 'active' && isInstructor && (
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center z-50">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-green-500 animate-pulse flex items-center justify-center">
                            <Video size={16} className="text-white" />
                         </div>
                         <span className="text-white font-bold text-sm">الجلسة جارية الآن</span>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            icon={<LogOut size={16}/>}
                            onClick={() => setIsFinishModalOpen(true)}
                        >
                            إنهاء الجلسة رسمياً
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex-1 relative">
                {renderContent()}
                <div ref={jitsiContainerRef} className={`w-full h-full ${status === 'active' ? 'block' : 'hidden'}`} />
            </div>

            {/* Finish Session Modal */}
            <Modal
                isOpen={isFinishModalOpen}
                onClose={() => setIsFinishModalOpen(false)}
                title="إنهاء وتوثيق الجلسة"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsFinishModalOpen(false)}>تراجع</Button>
                        <Button 
                            variant="success" 
                            onClick={handleFinishSession} 
                            loading={isSubmittingFinish}
                            icon={<Save />}
                        >
                            تأكيد الإنهاء والحفظ
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                        <MessageSquare className="text-blue-600 shrink-0 mt-1" />
                        <p className="text-sm text-blue-800">
                            عند تأكيد الإنهاء، سيتم إغلاق القاعة لجميع المشاركين وتحديث حالة الجلسة إلى "مكتملة" في سجل الطالب.
                        </p>
                    </div>
                    {/* Fixed FormField usage with missing import resolved */}
                    <FormField label="ملخص سريع للجلسة (اختياري)" htmlFor="finish-notes">
                        <Textarea 
                            id="finish-notes" 
                            value={finishNotes} 
                            onChange={e => setFinishNotes(e.target.value)} 
                            rows={4} 
                            placeholder="ما الذي تم إنجازه اليوم؟ هل هناك ملاحظات للطالب أو الإدارة؟"
                        />
                    </FormField>
                </div>
            </Modal>
        </div>
    );
};

export default SessionPage;
