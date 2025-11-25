
import React from 'react';
import { Eye, Target, Sparkles, Gem, Handshake, Globe } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import ShareButtons from '../components/shared/ShareButtons';
import { Card, CardContent } from '../components/ui/card';
import Image from '../components/ui/Image';

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <Card className="text-center transform hover:scale-105 transition-transform h-full shadow-lg border-t-4 border-primary/50">
        <CardContent className="pt-8">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed mt-2">{description}</p>
        </CardContent>
    </Card>
);

const JourneyStep: React.FC<{ icon: React.ReactNode; title: string; description: string; isLast?: boolean }> = ({ icon, title, description, isLast = false }) => (
    <div className="relative pl-8 sm:pl-12 py-6">
        {!isLast && <div className="absolute top-5 right-5 -mr-px mt-0.5 h-full w-0.5 bg-border rtl:right-auto rtl:left-5 rtl:-ml-px"></div>}
        <div className="relative flex items-center space-x-4 rtl:space-x-reverse">
            <div className="z-10 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center ring-8 ring-muted/50">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="text-2xl font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    </div>
);


const TeamMemberCard: React.FC<{ name: string; role: string; imageUrl: string; }> = ({ name, role, imageUrl }) => (
    <div className="text-center">
        <Image src={imageUrl} alt={name} className="w-32 h-32 rounded-full mx-auto ring-4 ring-background shadow-lg aspect-square" />
        <h4 className="text-xl font-bold mt-4">{name}</h4>
        <p className="text-primary font-semibold">{role}</p>
    </div>
);


const AboutPage: React.FC = () => {
    const { siteBranding, loading: isBrandingLoading } = useProduct();
    const { data, isLoading: isPublicDataLoading } = usePublicData();
    const pageUrl = window.location.href;
    const content = data?.siteContent?.aboutPage;

    if (isBrandingLoading || isPublicDataLoading) {
        return <PageLoader />;
    }

    const teamMembers = content?.teamMembers?.filter(member => member && member.name && member.role && member.imageUrl) || [];

    return (
        <div className="bg-background animate-fadeIn">
            {/* Hero Section */}
            <section 
                className="relative py-24 sm:py-32 text-center text-white bg-cover bg-center" 
                style={{ backgroundImage: `url(${siteBranding?.aboutHeroImageUrl || "https://i.ibb.co/8XYt2s5/about-us-image.jpg"})`}}
            >
                <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold">{content?.heroTitle || "رحلتنا: من فكرة إلى رؤية"}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-foreground/90">
                        {content?.missionStatement}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <ShareButtons 
                            title='تعرف على منصة الرحلة ورسالتنا في إلهام الأطفال' 
                            url={pageUrl} 
                            label="شارك الصفحة:"
                            theme="dark"
                        />
                    </div>
                </div>
            </section>

            {/* Our Journey Section */}
            <section className="py-16 sm:py-20 bg-muted/50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-4">
                        <JourneyStep 
                            icon={<Sparkles size={24} />}
                            title="الشرارة"
                            description={content?.ourStory || "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة 'منصة الرحلة' - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي."}
                        />
                         <JourneyStep 
                            icon={<Target size={24} />}
                            title="الرسالة"
                            description={content?.missionStatement || "نؤمن أن كل طفل هو بطل حكايته الخاصة. لذلك نصنع بحب وإتقان قصصاً ومنتجات تربوية مخصصة تماماً، تكون مرآة تعكس شخصية الطفل الفريدة، وتعزز هويته العربية، وتغرس في قلبه أسمى القيم الإنسانية."}
                        />
                         <JourneyStep 
                            icon={<Eye size={24} />}
                            title="الرؤية"
                            description={content?.ourVision || "أن نكون المنصة الرائدة والوجهة الأولى لكل أسرة عربية تبحث عن محتوى تربوي إبداعي وأصيل ينمّي شخصية الطفل، يعزز ارتباطه بلغته وهويته، ويطلق العنان لخياله الإبداعي."}
                            isLast
                        />
                    </div>
                </div>
            </section>
            
            {/* Meet The Team Section */}
            {(content?.showTeamSection !== false && teamMembers.length > 0) && (
                <section className="py-16 sm:py-20">
                     <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-12">{content?.teamTitle || "تعرف على بعض أفراد الفريق"}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto">
                            {teamMembers.map(member => (
                                <TeamMemberCard key={member.name} {...member} />
                            ))}
                        </div>
                     </div>
                </section>
            )}

             {/* Our Core Values */}
             <section className="bg-muted/50 py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-foreground mb-12">{content?.valuesTitle || "قيمنا الأساسية"}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                       <ValueCard 
                            icon={<Globe size={32} />}
                            title="🌿 الأصالة"
                            description="محتوى عربي أصيل يحافظ على الهوية"
                        />
                         <ValueCard 
                            icon={<Sparkles size={32} />}
                            title="💫 الإبداع"
                            description="حلول مبتكرة تواكب العصر"
                        />
                         <ValueCard 
                            icon={<Gem size={32} />}
                            title="💎 الجودة"
                            description="معايير عالية في كل ما نقدم"
                        />
                         <ValueCard 
                            icon={<Target size={32} />}
                            title="🎯 التخصيص"
                            description="كل طفل فريد ويستحق محتوى خاص"
                        />
                        <ValueCard 
                            icon={<Handshake size={32} />}
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
