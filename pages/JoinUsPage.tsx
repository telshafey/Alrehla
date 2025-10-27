import React, { useState } from 'react';
import { PenTool, Mic, Palette } from 'lucide-react';
// FIX: Removed .ts extension from import paths
import { useCommunicationMutations } from '../hooks/mutations';
import { useToast } from '../contexts/ToastContext';
import SupportForm from '../components/shared/SupportForm';
import OpportunityCard from '../components/shared/OpportunityCard';

const JoinUsPage: React.FC = () => {
    const { createJoinRequest } = useCommunicationMutations();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            await createJoinRequest.mutateAsync({
                name: data.name as string,
                email: data.email as string,
                role: data.subject as string, // Using 'subject' field from SupportForm as role
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
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">انضم إلى فريقنا</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        نحن نبحث دائمًا عن مبدعين شغوفين لمشاركة رحلتنا في إلهام الأطفال. هل أنت مستعد لإحداث فرق؟
                    </p>
                </div>
                
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">الفرص المتاحة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <OpportunityCard 
                            icon={<PenTool size={32} />}
                            title="مدرب كتابة إبداعية"
                            description="إرشاد وتوجيه الأطفال في رحلتهم لاكتشاف أصواتهم الإبداعية من خلال جلسات فردية ملهمة."
                        />
                         <OpportunityCard 
                            icon={<Palette size={32} />}
                            title="رسام قصص أطفال"
                            description="تحويل الكلمات إلى عوالم بصرية ساحرة، ورسم شخصيات تبقى في ذاكرة الأطفال."
                        />
                         <OpportunityCard 
                            icon={<Mic size={32} />}
                            title="معلق صوتي"
                            description="إعطاء حياة وشخصية للكلمات من خلال الأداء الصوتي للقصص المخصصة والمحتوى الصوتي."
                        />
                    </div>
                </section>
                
                <section className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">قدم طلبك الآن</h2>
                     <SupportForm 
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        subjectOptions={["مدرب كتابة إبداعية", "رسام قصص أطفال", "معلق صوتي", "أخرى"]}
                     />
                </section>
            </div>
        </div>
    );
};

export default JoinUsPage;