

import React, { useState } from 'react';
import { PenTool, Mic, Palette, Send } from 'lucide-react';
import { useCommunicationMutations } from '../hooks/mutations/useCommunicationMutations';
import OpportunityCard from '../components/shared/OpportunityCard';
import { Button } from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const JoinUsPage: React.FC = () => {
    const { createJoinRequest } = useCommunicationMutations();
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
                role: data.role as string,
                message: data.message as string,
                portfolio_url: data.portfolio_url as string,
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            // Error toast is handled in the mutation hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleOptions = ["مدرب كتابة إبداعية", "رسام قصص أطفال", "معلق صوتي", "أخرى"];

    return (
        <div className="bg-muted/50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">انضم إلى فريقنا</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        نحن نبحث دائمًا عن مبدعين شغوفين لمشاركة رحلتنا في إلهام الأطفال. هل أنت مستعد لإحداث فرق؟
                    </p>
                </div>
                
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-12">الفرص المتاحة</h2>
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
                
                <section className="max-w-2xl mx-auto">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">قدم طلبك الآن</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField label="الاسم" htmlFor="name">
                                        <Input type="text" name="name" id="name" required />
                                    </FormField>
                                    <FormField label="البريد الإلكتروني" htmlFor="email">
                                        <Input type="email" name="email" id="email" required />
                                    </FormField>
                                </div>
                                <FormField label="الدور المطلوب" htmlFor="role">
                                    <Select name="role" id="role" required>
                                        {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </Select>
                                </FormField>
                                <FormField label="رابط معرض الأعمال (اختياري)" htmlFor="portfolio_url">
                                    <Input type="url" name="portfolio_url" id="portfolio_url" placeholder="https://behance.net/yourname" />
                                </FormField>
                                <FormField label="رسالتك" htmlFor="message">
                                    <Textarea id="message" name="message" rows={5} required placeholder="أخبرنا المزيد عنك وعن سبب اهتمامك بالانضمام إلينا..."/>
                                </FormField>
                                <Button type="submit" loading={isSubmitting} icon={<Send size={18} />} className="w-full">
                                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                                </Button>
                            </form>
                        </CardContent>
                     </Card>
                </section>
            </div>
        </div>
    );
};

export default JoinUsPage;