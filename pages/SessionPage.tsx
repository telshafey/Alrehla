
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSessionDetails } from '../hooks/queries/user/useJourneyDataQuery';
import { useAdminJitsiSettings } from '../hooks/queries/admin/useAdminSettingsQuery';
import { Loader2, ShieldAlert, Clock, CheckCircle } from 'lucide-react';

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
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (difference <= 0) {
                onComplete();
            }
        }, 1000);
        
        const difference = +targetDate - +new Date();
        if (difference <= 0) {
          onComplete();
        }


        return () => clearTimeout(timer);
    });

    const timerComponents = [
        timeLeft.days > 0 && `${timeLeft.days} يوم`,
        timeLeft.hours > 0 && `${timeLeft.hours} ساعة`,
        `${timeLeft.minutes} دقيقة`,
        `${timeLeft.seconds} ثانية`,
    ].filter(Boolean).join(' و ');

    return <p className="text-xl font-bold">{timerComponents}</p>;
};

const SessionPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { currentUser, loading: authLoading } = useAuth();
    const { data: session, isLoading: sessionLoading } = useSessionDetails(sessionId);
    const { data: jitsiSettings, isLoading: settingsLoading } = useAdminJitsiSettings();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    
    const [status, setStatus] = useState<'loading' | 'waiting' | 'active' | 'ended' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [joinTime, setJoinTime] = useState<Date | null>(null);

    // Effect to check session status and timing
    useEffect(() => {
        if (authLoading || sessionLoading || settingsLoading) {
            setStatus('loading');
            return;
        }

        if (!currentUser) {
            navigate('/account');
            return;
        }

        if (!session) {
            setError('لم يتم العثور على تفاصيل الجلسة.');
            setStatus('error');
            return;
        }
        
        if (!jitsiSettings) {
            setError('فشل تحميل إعدادات التكامل.');
            setStatus('error');
            return;
        }

        const startTime = new Date(session.session_date);
        const joinMinutesBefore = jitsiSettings.join_minutes_before || 15;
        const expireMinutesAfter = jitsiSettings.expire_minutes_after || 120;
        
        const calculatedJoinTime = new Date(startTime.getTime() - joinMinutesBefore * 60000);
        const endTime = new Date(startTime.getTime() + expireMinutesAfter * 60000);
        const now = new Date();

        setJoinTime(calculatedJoinTime);

        if (session.status === 'completed' || session.status === 'missed' || now > endTime) {
            setStatus('ended');
        } else if (now < calculatedJoinTime) {
            setStatus('waiting');
        } else {
            setStatus('active');
        }

    }, [authLoading, sessionLoading, settingsLoading, currentUser, session, jitsiSettings, navigate]);

    // Effect to initialize Jitsi when status becomes active
    useEffect(() => {
        if (status !== 'active' || !jitsiSettings || !session || !currentUser) {
            return;
        }

        let jitsiApi: any = null;

        const initializeJitsi = async () => {
            // Permission check
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach(track => track.stop());
            } catch (err: any) {
                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    setError("للانضمام للجلسة، يرجى السماح بالوصول إلى الكاميرا والميكروفون في إعدادات المتصفح ثم تحديث الصفحة.");
                } else {
                    setError("لم نتمكن من الوصول إلى الكاميرا أو الميكروفون.");
                }
                setStatus('error');
                return;
            }

            // Initialization
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
                            TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'fullscreen', 'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'tileview'],
                        },
                    };

                    jitsiApi = new window.JitsiMeetExternalAPI(jitsiSettings.domain, options);
                } catch (e) {
                    setError("فشل تحميل مكون الفيديو. يرجى تحديث الصفحة.");
                    setStatus('error');
                }
            } else {
                 setError("فشل تحميل مكتبة الفيديو. يرجى تحديث الصفحة.");
                 setStatus('error');
            }
        };

        initializeJitsi();

        return () => {
            jitsiApi?.dispose();
        };
    }, [status, currentUser, session, jitsiSettings]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex flex-col justify-center items-center h-full">
                        <Loader2 className="animate-spin h-12 w-12 text-white" />
                        <p className="mt-4 text-gray-300">جاري تجهيز غرفة الاجتماع...</p>
                    </div>
                );
            case 'waiting':
                return (
                    <div className="flex flex-col justify-center items-center h-full text-white text-center p-4">
                        <Clock className="h-16 w-16 text-blue-300 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">الجلسة لم تبدأ بعد</h2>
                        <p className="max-w-md text-gray-300 mb-4">سيتم فتح الغرفة تلقائياً عند بدء موعد الجلسة.</p>
                        {joinTime && <CountdownTimer targetDate={joinTime} onComplete={() => setStatus('active')} />}
                    </div>
                );
            case 'ended':
                 return (
                    <div className="flex flex-col justify-center items-center h-full text-white text-center p-4">
                        <CheckCircle className="h-16 w-16 text-green-300 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">انتهت الجلسة</h2>
                        <p className="max-w-md text-gray-300">تم أرشفة هذه الجلسة ولا يمكن الانضمام إليها.</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex flex-col justify-center items-center h-full text-white text-center p-4">
                        <ShieldAlert className="h-16 w-16 text-red-400 mb-4" />
                        <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
                        <p className="max-w-md text-gray-300">{error}</p>
                    </div>
                );
            case 'active':
                return null; // Jitsi will render here
        }
    };

    return (
        <div className="w-full h-screen bg-black">
            {renderContent()}
            <div ref={jitsiContainerRef} className={`w-full h-full ${status === 'active' ? 'opacity-100' : 'opacity-0 h-0 w-0'}`}>
                {/* Jitsi meeting will be embedded here */}
            </div>
        </div>
    );
};

export default SessionPage;
