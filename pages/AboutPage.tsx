import React from 'react';
import { Eye, Target, Sparkles, Gem, Handshake, Globe } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import ShareButtons from '../components/shared/ShareButtons';

// A small reusable component for value points
const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full text-center border transform hover:scale-105 transition-transform">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-3">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed mt-2">{description}</p>
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

    return (
        <div className="bg-white animate-fadeIn">
            {/* Hero Section (Mission) */}
            <section className="bg-blue-50 py-20 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">رسالتنا</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        {content?.missionStatement || "nؤمن أن كل طفل هو بطل حكايته الخاصة. لذلك نصنع بحب وإتقان قصصاً ومنتجات تربوية مخصصة تماماً، تكون مرآة تعكس شخصية الطفل الفريدة، وتعزز هويته العربية، وتغرس في قلبه أسمى القيم الإنسانية."}
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">قصتنا</h2>
                            <p className="text-gray-600 leading-relaxed">
                               {content?.ourStory || "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة \"منصة الرحلة\" - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي."}
                            </p>
                        </div>
                        <div>
                            <img src={siteBranding?.aboutImageUrl || "https://i.ibb.co/8XYt2s5/about-us-image.jpg"} alt="طفلة تقرأ وتتعلم بشغف" className="rounded-2xl shadow-xl" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Our Vision */}
            <section className="bg-blue-50 py-20">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <Eye className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800">رؤيتنا</h2>
                    <p className="mt-4 text-lg text-gray-600">
                      {content?.ourVision || "أن نكون المنصة الرائدة والوجهة الأولى لكل أسرة عربية تبحث عن محتوى تربوي إبداعي وأصيل ينمّي شخصية الطفل، يعزز ارتباطه بلغته وهويته، ويطلق العنان لخياله الإبداعي."}
                    </p>
                </div>
            </section>
            
             {/* Our Core Values */}
             <section className="bg-white py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">قيمنا الأساسية</h2>
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