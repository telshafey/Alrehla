import React, { useState } from 'react';
import { Mail, HelpCircle } from 'lucide-react';
// FIX: Removed .tsx extension from import paths
import SupportForm from '../components/shared/SupportForm';
import FAQSection from '../components/shared/FAQSection';
import { useCommunicationMutations } from '../hooks/mutations';
import { useToast } from '../contexts/ToastContext';

const faqs = {
  enhaLak: [
    { q: 'كيف تتم عملية تخصيص القصة؟', a: 'ببساطة! عند طلب المنتج، ستقوم بملء نموذج ببيانات طفلك مثل اسمه وعمره واهتماماته، بالإضافة إلى رفع صورته. يقوم فريقنا من الكتّاب المتخصصين باستخدام هذه المعلومات لصياغة قصة فريدة يكون فيها طفلك هو البطل.' },
    { q: 'كم من الوقت يستغرق تجهيز الطلب؟', a: 'عادةً ما يستغرق تجهيز الطلبات المخصصة من 5 إلى 7 أيام عمل قبل الشحن. نحن نولي كل قصة اهتماماً خاصاً لضمان أعلى جودة.' },
    { q: 'ما هي الأعمار المناسبة للقصص؟', a: 'منتجاتنا مصممة لتناسب الأطفال من عمر 3 إلى 9 سنوات. يتم تكييف مستوى اللغة والمحتوى ليتناسب مع الفئة العمرية التي تحددها عند الطلب.' },
    { q: 'هل يمكنني معاينة القصة قبل الطباعة؟', a: 'حاليًا، لا نوفر خيار المعاينة المسبقة لضمان سرعة عملية الإنتاج. لكن كن مطمئنًا، فريقنا مبدع ومحترف في صياغة قصص تلامس قلوب الأطفال بناءً على التفاصيل التي تقدمها.' },
  ],
  creativeWriting: [
    { q: 'كيف تتم الجلسات التعليمية؟', a: 'تتم الجلسات بشكل فردي (واحد لواحد) بين المدرب والطالب عبر الإنترنت من خلال منصة فيديو آمنة. تكون الجلسة تفاعلية وتركز بالكامل على احتياجات طفلك الإبداعية.' },
    { q: 'هل يمكنني اختيار مدرب معين؟', a: 'نعم! عند حجز الباقة، يمكنك استعراض ملفات المدربين المتاحين واختيار المدرب الذي تشعر أنه الأنسب لطفلك، بناءً على مواعيده المتاحة.' },
    { q: 'ما هي المنصة المستخدمة للجلسات؟', a: 'نستخدم منصة Jitsi Meet الآمنة والمشفرة، والتي تعمل مباشرة من المتصفح دون الحاجة لتثبيت أي برامج إضافية، مما يضمن تجربة سهلة وآمنة.' },
    { q: 'هل يحصل الطالب على شهادة؟', a: 'بالتأكيد. عند إتمام باقة الجلسات، يحصل الطالب على شهادة إتمام للبرنامج، بالإضافة إلى محفظة أعمال رقمية تضم إبداعاته التي أنجزها خلال الرحلة.' },
  ],
  subscriptionBox: [
      { q: 'كيف يعمل الاشتراك في صندوق الرحلة الشهري؟', a: 'بمجرد اشتراكك، سيصلك صندوق مميز إلى باب منزلك كل شهر. يحتوي كل صندوق على قصة مخصصة جديدة وأنشطة وهدايا إضافية مصممة بعناية لتناسب عمر طفلك واهتماماته.' },
      { q: 'هل يمكنني إيقاف اشتراكي مؤقتًا؟', a: 'نعم، نحن نوفر المرونة الكاملة. يمكنك إيقاف اشتراكك مؤقتًا أو إلغاؤه في أي وقت من خلال صفحة حسابك.' },
      { q: 'كيف يمكنني تحديث عنوان الشحن الخاص بالاشتراك؟', a: 'يمكنك تحديث عنوان الشحن بسهولة من خلال إعدادات حسابك في قسم "الاشتراكات".' },
  ],
  general: [
    { q: 'ما هي طرق الدفع المتاحة؟ وهل هي آمنة؟', a: 'نحن نقبل الدفع عبر المحافظ الإلكترونية وInstapay. تتم جميع عمليات الدفع عبر بوابات آمنة وموثوقة لضمان حماية بياناتك المالية.' },
    { q: 'هل تقومون بالشحن خارج مصر؟', a: 'حاليًا، خدمات الشحن لدينا تغطي جميع محافظات جمهورية مصر العربية. نعمل على التوسع لتغطية المزيد من الدول قريبًا.' },
    { q: 'كم تبلغ تكلفة الشحن؟', a: 'تختلف تكلفة الشحن حسب المحافظة. يمكنك رؤية التكلفة الدقيقة عند إدخال عنوانك في صفحة إتمام الطلب.' },
    { q: 'كيف يمكنني تتبع طلبي؟', a: 'بمجرد شحن طلبك، ستتلقى تحديثًا بحالة الطلب. يمكنك أيضًا متابعة حالة جميع طلباتك من خلال صفحة "الطلبات" في حسابك.' },
  ],
};

const SupportPage: React.FC = () => {
    const { createSupportTicket } = useCommunicationMutations();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await createSupportTicket.mutateAsync({
                name: data.name as string,
                email: data.email as string,
                subject: data.subject as string,
                message: data.message as string,
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            // Error toast is handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">الدعم والمساعدة</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        هل لديك سؤال؟ لقد أجبنا على أكثر الاستفسارات شيوعًا هنا.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* FAQs */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><HelpCircle /> الأسئلة الشائعة</h2>
                        <FAQSection category='منتجات "إنها لك"' items={faqs.enhaLak} />
                        <FAQSection category='برنامج "بداية الرحلة"' items={faqs.creativeWriting} />
                        <FAQSection category='صندوق الرحلة الشهري' items={faqs.subscriptionBox} />
                        <FAQSection category="أسئلة عامة" items={faqs.general} />
                    </div>
                    
                    {/* Contact Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Mail /> لم تجد إجابتك؟ تواصل معنا</h2>
                            <SupportForm 
                                onSubmit={handleSubmit} 
                                isSubmitting={isSubmitting} 
                                subjectOptions={["استفسار عام", "مشكلة في الطلب", "اقتراح", "مشكلة تقنية"]}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SupportPage;