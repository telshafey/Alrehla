
import React, { useState, useMemo } from 'react';
import { Mail, HelpCircle, MessageCircle, Search, Package, BookOpen, Truck, RefreshCw } from 'lucide-react';
import SupportForm from '../components/shared/SupportForm';
import FAQSection from '../components/shared/FAQSection';
import { useCommunicationMutations } from '../hooks/mutations/useCommunicationMutations';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const SupportPage: React.FC = () => {
    const { createSupportTicket } = useCommunicationMutations();
    const { data: publicData } = usePublicData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const comms = publicData?.communicationSettings;
    const content = publicData?.siteContent?.supportPage;
    const faqs = content?.faqs || [];

    const whatsappUrl = comms?.whatsapp_number 
        ? `https://wa.me/${comms.whatsapp_number}?text=${encodeURIComponent(comms.whatsapp_default_message || "مرحباً")}`
        : '#';

    // Filter FAQs based on search
    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return faqs;
        const lowerTerm = searchTerm.toLowerCase();
        return faqs.filter(item => 
            item.question.toLowerCase().includes(lowerTerm) || 
            item.answer.toLowerCase().includes(lowerTerm)
        );
    }, [faqs, searchTerm]);

    // Group FAQs by category
    const groupedFaqs = useMemo(() => {
        return filteredFaqs.reduce((acc, item) => {
            const category = item.category || 'عام';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ q: item.question, a: item.answer });
            return acc;
        }, {} as Record<string, { q: string; a: string }[]>);
    }, [filteredFaqs]);

    // Preferred order for categories
    const preferredOrder = ['منتجات "إنها لك"', 'برنامج "بداية الرحلة"', 'صندوق الرحلة الشهري', 'أسئلة عامة والشحن'];
    const sortedCategories = Object.keys(groupedFaqs).sort((a, b) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

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
        <div className="bg-muted/30 animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-primary py-16 text-primary-foreground text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-extrabold mb-4">{content?.heroTitle || 'كيف يمكننا مساعدتك؟'}</h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                        {content?.heroSubtitle || 'تصفح الأسئلة الشائعة أو تواصل مع فريق الدعم مباشرة للحصول على المساعدة.'}
                    </p>
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                            type="text" 
                            placeholder="ابحث في الأسئلة الشائعة..." 
                            className="pr-12 h-12 rounded-full shadow-lg text-foreground"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* FAQs Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                            <HelpCircle className="text-primary" /> الأسئلة الشائعة
                        </h2>
                        
                        {sortedCategories.length > 0 ? (
                            sortedCategories.map(category => (
                                <Card key={category} className="overflow-hidden border-t-4 border-t-primary/10">
                                    <CardHeader className="bg-muted/50 pb-4">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {category.includes('إنها لك') && <Package size={20} className="text-pink-500"/>}
                                            {category.includes('بداية الرحلة') && <BookOpen size={20} className="text-blue-500"/>}
                                            {category.includes('الشحن') && <Truck size={20} className="text-green-500"/>}
                                            {category}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <FAQSection category="" items={groupedFaqs[category]} />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">لا توجد نتائج</h3>
                                <p className="text-muted-foreground">لم نتمكن من العثور على أسئلة تطابق بحثك. حاول استخدام كلمات أخرى.</p>
                                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">عرض كل الأسئلة</Button>
                            </div>
                        )}
                    </div>
                    
                    {/* Contact Forms Column */}
                    <div className="lg:col-span-1 space-y-8 sticky top-24 h-fit">
                         <Card className="border-green-100 bg-green-50/50">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2 text-green-800"><MessageCircle /> محادثة فورية</CardTitle>
                              <CardDescription>فريق الدعم متاح عبر واتساب يومياً من 9 ص إلى 9 م.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button as="a" href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-transform hover:-translate-y-1">
                                    تواصل عبر واتساب
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2"><Mail /> أرسل تذكرة دعم</CardTitle>
                              <CardDescription>سنقوم بالرد عليك عبر البريد الإلكتروني خلال 24 ساعة.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <SupportForm 
                                  onSubmit={handleSubmit} 
                                  isSubmitting={isSubmitting} 
                                  subjectOptions={["استفسار عام", "مشكلة في الطلب", "اقتراح", "مشكلة تقنية", "شكوى"]}
                              />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
