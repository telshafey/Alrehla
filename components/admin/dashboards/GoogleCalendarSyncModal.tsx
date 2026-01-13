
import React, { useState } from 'react';
import { Calendar, Copy, Check, ExternalLink, Info, Smartphone, Laptop, Globe, RefreshCw } from 'lucide-react';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { DEFAULT_CONFIG } from '../../../lib/config';

interface GoogleCalendarSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    // رابط iCal الديناميكي (HTTPS لسهولة النسخ واللصق)
    // نستخدم عنوان المشروع من الإعدادات لضمان الديناميكية
    const projectUrl = DEFAULT_CONFIG.supabase.projectUrl;
    const calendarUrl = `${projectUrl}/functions/v1/instructor-calendar?id=${currentUser?.id}`;
    
    // رابط الاشتراك المباشر لـ Google Calendar (يفتح واجهة الإضافة فوراً)
    const googleSubscribeUrl = `https://calendar.google.com/calendar/r/settings/addbyurl?cid=${encodeURIComponent(calendarUrl)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(calendarUrl);
        setCopied(true);
        addToast('تم نسخ رابط المزامنة (iCal) بنجاح!', 'success');
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="إعدادات مزامنة التقويم"
            size="xl"
            footer={<Button onClick={onClose} variant="ghost">إغلاق</Button>}
        >
            <Tabs defaultValue="google">
                <TabsList className="w-full">
                    <TabsTrigger value="google" className="flex-1">Google Calendar</TabsTrigger>
                    <TabsTrigger value="other" className="flex-1">Outlook / Apple</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-4 mb-6">
                        <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                            <Info size={24} />
                        </div>
                        <div className="text-sm leading-relaxed text-blue-800">
                            <p className="font-bold mb-1">كيف تعمل المزامنة؟</p>
                            <p>عن طريق الاشتراك في رابط iCal الخاص بك، ستظهر جلساتك تلقائياً في تقويمك الشخصي. أي جلسة جديدة تُضاف أو تُعدل هنا ستنعكس هناك (قد يستغرق التحديث بضع ساعات حسب خدمة التقويم).</p>
                        </div>
                    </div>

                    <TabsContent value="google" className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="p-6 border-2 border-dashed rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-4">
                                <Calendar className="w-16 h-16 text-blue-600" />
                                <h3 className="font-bold text-lg">الاشتراك السريع</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">اضغط على الزر أدناه لفتح تقويم جوجل وإضافة جدولك مباشرة.</p>
                                <a 
                                    href={googleSubscribeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg"
                                >
                                    <PlusIcon /> إضافة إلى تقويم جوجل
                                </a>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="other" className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-sm font-black text-gray-700 block">رابط المزامنة اليدوي (iCal URL):</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted p-3 rounded-xl border font-mono text-[10px] break-all text-muted-foreground dir-ltr">
                                    {calendarUrl}
                                </div>
                                <Button 
                                    onClick={handleCopy} 
                                    variant={copied ? "success" : "default"} 
                                    className="shrink-0 h-11 w-11 p-0 rounded-xl"
                                    title="نسخ الرابط"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Smartphone size={16}/> iPhone / iPad</h4>
                                    <ol className="text-[10px] list-decimal list-inside text-muted-foreground space-y-1">
                                        <li>انتقل إلى الإعدادات &gt; التقويم &gt; الحسابات.</li>
                                        <li>اختر "إضافة حساب" &gt; "أخرى".</li>
                                        <li>اختر "إضافة تقويم مشترك" وألصق الرابط.</li>
                                    </ol>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Laptop size={16}/> Outlook Desktop</h4>
                                    <ol className="text-[10px] list-decimal list-inside text-muted-foreground space-y-1">
                                        <li>افتح التقويم.</li>
                                        <li>انقر بزر الماوس الأيمن على "My Calendars".</li>
                                        <li>اختر Add Calendar &gt; From Internet وألصق الرابط.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </Modal>
    );
};

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
    </svg>
);

export default GoogleCalendarSyncModal;
