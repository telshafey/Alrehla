
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const SessionPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { currentUser, loading: authLoading } = useAuth();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!currentUser) {
            navigate('/account');
            return;
        }
        
        let jitsiApi: any = null;

        const initializeSession = async () => {
            setLoading(true);
            setError(null);
            
            // Step 1: Request Camera/Microphone permissions
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                // We have permissions. Stop the stream tracks immediately so the camera light goes off
                // until Jitsi takes over.
                stream.getTracks().forEach(track => track.stop());
            } catch (err: any) {
                console.error('Permission denied or error:', err);
                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    setError("للانضمام للجلسة، يرجى السماح بالوصول إلى الكاميرا والميكروفون في إعدادات المتصفح ثم تحديث الصفحة.");
                } else {
                    setError("لم نتمكن من الوصول إلى الكاميرا أو الميكروفون. يرجى التحقق من توصيلها ومنح الإذن في إعدادات المتصفح.");
                }
                setLoading(false);
                return; // Stop initialization
            }

            // Step 2: Initialize Jitsi Meet
            if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
                try {
                    const domain = 'meet.jit.si';
                    const options = {
                        roomName: `AlRehlah-Session-${sessionId}`,
                        width: '100%',
                        height: '100%',
                        parentNode: jitsiContainerRef.current,
                        userInfo: {
                            displayName: currentUser.name || currentUser.email
                        },
                        configOverwrite: {
                            prejoinPageEnabled: false,
                            startWithAudioMuted: false,
                            startWithVideoMuted: false,
                        },
                        interfaceConfigOverwrite: {
                            SHOW_JITSI_WATERMARK: false,
                            SHOW_WATERMARK_FOR_GUESTS: false,
                            TOOLBAR_BUTTONS: [
                                'microphone', 'camera', 'desktop', 'fullscreen',
                                'fodeviceselection', 'hangup', 'profile', 'chat',
                                'settings', 'tileview', 'toggle-camera',
                            ],
                        },
                    };

                    jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
                    jitsiApi.addEventListener('videoConferenceJoined', () => {
                       setLoading(false);
                    });
                } catch (e) {
                    console.error("Jitsi failed to load", e);
                    setError("فشل تحميل مكون الفيديو. يرجى التأكد من أن اتصالك بالإنترنت يسمح بالوصول إلى meet.jit.si");
                    setLoading(false);
                }
            } else {
                setError("فشل تحميل مكتبة الفيديو. يرجى تحديث الصفحة والمحاولة مرة أخرى.");
                setLoading(false);
            }
        };

        initializeSession();

        return () => {
            jitsiApi?.dispose();
        };
    }, [sessionId, currentUser, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
                <p className="mt-4 text-gray-600">جاري التحقق من الهوية...</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-screen bg-black">
            {loading && !error && (
                <div className="flex flex-col justify-center items-center h-full">
                    <Loader2 className="animate-spin h-12 w-12 text-white" />
                    <p className="mt-4 text-gray-300">جاري تجهيز غرفة الاجتماع...</p>
                </div>
            )}
            {error && (
                 <div className="flex flex-col justify-center items-center h-full text-white text-center p-4">
                    <ShieldAlert className="h-16 w-16 text-red-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
                    <p className="max-w-md text-gray-300">{error}</p>
                </div>
            )}
            <div ref={jitsiContainerRef} className={`w-full h-full transition-opacity duration-500 ${loading || error ? 'opacity-0' : 'opacity-100'}`}>
                {/* Jitsi meeting will be embedded here */}
            </div>
        </div>
    );
};

export default SessionPage;
