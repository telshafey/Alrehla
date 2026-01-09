
import React, { useState, useMemo } from 'react';
import { Mail, HelpCircle, MessageCircle, Search, Package, BookOpen, Truck, LifeBuoy, Phone, Feather, Layers } from 'lucide-react';
import SupportForm from '../components/shared/SupportForm';
import FAQSection from '../components/shared/FAQSection';
import { useCommunicationMutations } from '../hooks/mutations/useCommunicationMutations';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

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

    // Categorize FAQs for Tabs
    const categorizedFaqs = useMemo(() => {
        const enhaLakKeywords = ['إنها لك', 'منتج', 'قصة', 'شحن', 'توصيل', 'صندوق'];
        const cwKeywords = ['بداية الرحلة', 'كتابة', 'جلسة', 'مدرب', 'زوم', 'برنامج'];
        
        const enhaLak = filteredFaqs.filter(f => enhaLakKeywords.some(k => f.category?.includes(k)));
        const creativeWriting = filteredFaqs.filter(f => cwKeywords.some(k => f.category?.includes(k)));
        
        // General are those not in the above lists OR explicitly marked as General
        const general = filteredFaqs.filter(f => 
            !enhaLak.includes(f) && !creativeWriting.includes(f)
        );

        return { enhaLak, creativeWriting, general };
    }, [filteredFaqs]);

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
        <div className="bg-muted/30 animate-fadeIn min-h-screen">
            {/* Hero Section */}
            <div className="bg-primary py-16 text-primary-foreground text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl font-extrabold mb-4">{content?.heroTitle || 'مركز الدعم والمساعدة'}</h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8 text-blue-100">
                        {content?.heroSubtitle || 'نحن هنا لمساعدتك في كل خطوة من رحلتك معنا.'}
                    </p>
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                            type="text" 
                            placeholder="ابحث عن سؤالك هنا..." 
                            className="pr-12 h-14 rounded-full shadow-xl text-foreground text-lg border-0 focus-visible:ring-offset-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content (FAQs) */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary" /> الأسئلة الشائعة</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="enha-lak" className="w-full">
                                    <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 mb-6 flex-wrap">
                                        <TabsTrigger value="enha-lak" className="flex-1 py-3 gap-2 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                                            <Package size={18} /> منتجات "إنها لك"
                                        </TabsTrigger>
                                        <TabsTrigger value="creative-writing" className="flex-1 py-3 gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                                            <Feather size={18} /> بداية الرحلة
                                        </TabsTrigger>
                                        <TabsTrigger value="general" className="flex-1 py-3 gap-2 data-[state=active]:bg-gray-200">
                                            <Layers size={18} /> أسئلة عامة
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="enha-lak" className="space-y-4 animate-fadeIn">
                                        {categorizedFaqs.enhaLak.length > 0 ? (
                                            <FAQSection category="الطلبات والشحن والمنتجات" items={categorizedFaqs.enhaLak.map(f => ({ q: f.question, a: f.answer }))} />
                                        ) : <p className="text-center py-8 text-muted-foreground">لا توجد أسئلة في هذا القسم.</p>}
                                    </TabsContent>

                                    <TabsContent value="creative-writing" className="space-y-4 animate-fadeIn">
                                        {categorizedFaqs.creativeWriting.length > 0 ? (
                                            <FAQSection category="الجلسات والمدربين والبرامج" items={categorizedFaqs.creativeWriting.map(f => ({ q: f.question, a: f.answer }))} />
                                        ) : <p className="text-center py-8 text-muted-foreground">لا توجد أسئلة في هذا القسم.</p>}
                                    </TabsContent>

                                    <TabsContent value="general" className="space-y-4 animate-fadeIn">
                                        {categorizedFaqs.general.length > 0 ? (
                                            <FAQSection category="الحساب والدفع وأخرى" items={categorizedFaqs.general.map(f => ({ q: f.question, a: f.answer }))} />
                                        ) : <p className="text-center py-8 text-muted-foreground">لا توجد أسئلة في هذا القسم.</p>}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Sidebar (Contact Info & Form) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Direct Contact Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="bg-green-50 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-green-800 mb-1">واتساب (محادثة فورية)</p>
                                        <p className="text-xs text-green-600">متاح يومياً من 9 ص - 9 م</p>
                                    </div>
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors">
                                        <MessageCircle size={24} />
                                    </a>
                                </CardContent>
                            </Card>

                             <Card className="bg-blue-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-blue-800 mb-1">البريد الإلكتروني</p>
                                        <p className="text-xs text-blue-600">للشكاوى والمقترحات الرسمية</p>
                                    </div>
                                    <a href={`mailto:${comms?.support_email}`} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                                        <Mail size={24} />
                                    </a>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <Card className="shadow-lg border-t-4 border-t-primary">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2"><LifeBuoy /> تذكرة دعم فني</CardTitle>
                              <CardDescription>لم تجد إجابة لسؤالك؟ أرسل لنا وسنرد خلال 24 ساعة.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <SupportForm 
                                  onSubmit={handleSubmit} 
                                  isSubmitting={isSubmitting} 
                                  subjectOptions={[
                                      "مشكلة في طلب (إنها لك)", 
                                      "استفسار عن بداية الرحلة", 
                                      "مشكلة في الدفع", 
                                      "مشكلة تقنية في الموقع", 
                                      "اقتراح أو شكوى"
                                  ]}
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
