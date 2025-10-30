import React from 'react';
import { Eye, Target, Sparkles, Gem, Handshake, Globe } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import ShareButtons from '../components/shared/ShareButtons';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <Card className="text-center transform hover:scale-105 transition-transform h-full">
        <CardContent className="pt-6">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto mb-3">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed mt-2">{description}</p>
        </CardContent>
    </Card>
);


const AboutPage: React.FC = () => {
    const { siteBranding, loading: isBrandingLoading } = useProduct();
    const { data, isLoading: isPublicDataLoading } = usePublicData();
    const pageUrl = window.location.href;
    const content = data?.siteContent?.aboutPage;

    if (isBrandingLoading || isPublicDataLoading) {
        return <PageLoader />;
    }

    return (
        <div className="bg-background animate-fadeIn">
            {/* Hero Section (Mission) */}
            <section className="bg-muted/50 py-20 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">{content?.heroTitle}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        {content?.missionStatement}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <ShareButtons 
                            title='تعرف على منصة الرحلة ورسالتنا في إلهام الأطفال' 
                            url={pageUrl} 
                            label="شارك الصفحة:"
                        />
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-last md:order-first">
                            <h2 className="text-3xl font-bold text-foreground mb-4">قصتنا</h2>
                            <p className="text-muted-foreground leading-relaxed">
                               {content?.ourStory}
                            </p>
                        </div>
                        <div>
                            <img src={siteBranding?.aboutImageUrl || "https://i.ibb.co/8XYt2s5/about-us-image.jpg"} alt="طفلة تقرأ وتتعلم بشغف" className="rounded-2xl shadow-xl" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Our Vision */}
            <section className="bg-muted/50 py-20">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <Eye className="mx-auto h-16 w-16 text-primary/80 mb-4" />
                    <h2 className="text-3xl font-bold text-foreground">رؤيتنا</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      {content?.ourVision}
                    </p>
                </div>
            </section>
            
             {/* Our Core Values */}
             <section className="bg-background py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-12">{content?.valuesTitle}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                       <ValueCard 
                            icon={<Globe />}
                            title="🌿 الأصالة"
                            description="محتوى عربي أصيل يحافظ على الهوية"
                        />
                         <ValueCard 
                            icon={<Sparkles />}
                            title="💫 الإبداع"
                            description="حلول مبتكرة تواكب العصر"
                        />
                         <ValueCard 
                            icon={<Gem />}
                            title="💎 الجودة"
                            description="معايير عالية في كل ما نقدم"
                        />
                         <ValueCard 
                            icon={<Target />}
                            title="🎯 التخصيص"
                            description="كل طفل فريد ويستحق محتوى خاص"
                        />
                        <ValueCard 
                            icon={<Handshake />}
                            title="🤝 الشمولية"
                            description="خدماتنا للجميع بغض النظر عن الخلفية"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
