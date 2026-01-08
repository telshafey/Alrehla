
import React, { useState } from 'react';
import { Calendar, Copy, Check, ExternalLink, Info, Smartphone, Laptop, Globe } from 'lucide-react';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

interface GoogleCalendarSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    // توليد رابط iCal تجريبي يعتمد على معرف المستخدم
    // في النظام الحقيقي، هذا الرابط يشير لـ API Endpoint يقوم بتوليد ملف .ics حقيقي
    const calendarUrl = `webcal://mqsmgtparbdpvnbyxokh.supabase.co/functions/v1/instructor-calendar?id=${currentUser?.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(calendarUrl);
        setCopied(true);
        addToast('تم نسخ رابط المزامنة بنجاح!', 'success');
        setTimeout(() => setCopied(false), 3000);
    };

    const instructions = [
        {
            icon: <Smartphone className="text-blue-500" />,
            title: "على الهاتف (iPhone/Android)",
            text: "افتح الرابط مباشرة في متصفح الهاتف، وسيطلب منك النظام الاشتراك في التقويم وإضافته لتطبيق التقويم الافتراضي."
        },
        {
            icon: <Globe className="text-red-500" />,
            title: "Google Calendar (كمبيوتر)",
            text: "افتح تقويم جوجل، اضغط على (+) بجانب 'تقاويم أخرى'، اختر 'من عنوان URL' والصق الرابط هناك."
        },
        {
            icon: <Laptop className="text-gray-700" />,
            title: "Outlook / Apple Mail",
            text: "اختر 'إضافة تقويم من الإنترنت' أو 'Subscribe to Calendar' والصق الرابط."
        }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="مزامنة المواعيد مع تقويمك الشخصي"
            size="2xl"
            footer={<Button onClick={onClose} variant="ghost">إغلاق</Button>}
        >
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                        <Info size={24} />
                    </div>
                    <div className="text-sm leading-relaxed text-blue-800">
                        <p className="font-bold mb-1">كيف تعمل المزامنة؟</p>
                        <p>عند ربط هذا الرابط، ستظهر أي جلسة جديدة يتم جدولتها في المنصة تلقائياً على هاتفك أو حاسوبك الشخصي دون الحاجة لفتح الموقع.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-black text-gray-700 block">رابط المزامنة الخاص بك (iCal):</label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted p-3 rounded-xl border font-mono text-[10px] break-all text-muted-foreground dir-ltr">
                            {calendarUrl}
                        </div>
                        <Button 
                            onClick={handleCopy} 
                            variant={copied ? "success" : "default"} 
                            className="shrink-0 h-11 w-11 p-0 rounded-xl"
                        >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </Button>
                    </div>
                    <p className="text-[10px] text-orange-600 font-bold italic">* لا تقم بمشاركة هذا الرابط مع أحد، فهو يحتوي على جدول جلساتك الخاصة.</p>
                </div>

                <div className="border-t pt-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-primary" /> خطوات التفعيل:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {instructions.map((item, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border hover:border-primary/30 transition-colors">
                                <div className="mb-3">{item.icon}</div>
                                <p className="font-bold text-xs mb-2">{item.title}</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex justify-center">
                    <a 
                        href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 text-xs border border-blue-200 text-blue-700 hover:bg-blue-50 h-9 rounded-md px-3"
                    >
                        فتح إعدادات Google Calendar <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </Modal>
    );
};

export default GoogleCalendarSyncModal;
