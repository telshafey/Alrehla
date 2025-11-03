import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Feather, Target, ArrowLeft, Search, Edit, Gift } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import TestimonialCard from '../components/shared/TestimonialCard';
import PostCard from '../components/shared/PostCard';
import PageLoader from '../components/ui/PageLoader';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/card';
import Image from '../components/ui/Image';

const HeroSection: React.FC<{ backgroundUrl: string | null; content: any }> = ({ backgroundUrl, content }) => (
    <section className="relative bg-cover bg-center py-20 sm:py-32 lg:py-40" style={{ backgroundImage: `url(${backgroundUrl || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/70 to-black/70"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight animate-fadeIn">
                {content?.heroTitle || "رحلة كل طفل تبدأ بقصة... وقصته تبدأ هنا"}
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-200 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                {content?.heroSubtitle || "منصة تربوية عربية متكاملة تصنع قصصاً مخصصة تجعل طفلك بطلاً، وتطلق مواهبه في الكتابة الإبداعية"}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <Button as={Link} to="/enha-lak/store" size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                    اطلب قصتك المخصصة الآن
                </Button>
                <Button as={Link} to="/creative-writing" size="lg" variant="secondary" className="shadow-lg transition-transform transform hover:scale-105">
                    اكتشف برنامج الكتابة الإبداعية
                </Button>
            </div>
        </div>
    </section>
);

const ProjectCard: React.FC<{ title: string; description: string; link: string; imageUrl: string | null; icon: React.ReactNode; }> = ({ title, description, link, imageUrl, icon }) => (
    <Link to={link} className="block group relative rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
        <Image src={imageUrl || ''} alt={title} className="absolute inset-0 aspect-[4/5] sm:aspect-video lg:aspect-[4/5]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative p-8 h-full flex flex-col justify-end text-white">
            <div className="mb-4 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full shadow-lg w-fit transition-transform transform group-hover:scale-110">
                {icon}
            </div>
            <h3 className="text-4xl font-extrabold">{title}</h3>
            <p className="mt-2 max-w-sm opacity-90">{description}</p>
            <div className="mt-6 flex items-center font-semibold text-lg transition-transform transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <span>اعرف المزيد</span>
                <ArrowLeft size={22} className="ms-2" />
            </div>
        </div>
    </Link>
);

const HowItWorksStep: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4 text-primary">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
);


const PortalPage: React.FC = () => {
    const { siteBranding, loading: productLoading } = useProduct();
    const { data, isLoading: publicDataLoading } = usePublicData();
    const { blogPosts, siteContent } = data || {};

    if (productLoading || publicDataLoading) {
        return <PageLoader text="جاري تجهيز الصفحة الرئيسية..." />;
    }

    const publishedPosts = blogPosts || [];
    
    return (
        <div className="bg-background animate-fadeIn">
            <HeroSection backgroundUrl={siteBranding?.heroImageUrl} content={siteContent?.portalPage} />
            
            <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{siteContent?.portalPage.projectsTitle}</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{siteContent?.portalPage.projectsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <ProjectCard
                            title={siteContent?.portalPage.enhaLakTitle || 'إنها لك'}
                            description={siteContent?.portalPage.enhaLakDescription || "قصص مخصصة ومنتجات تربوية فريدة تجعل طفلك بطل الحكاية الحقيقي"}
                            link="/enha-lak"
                            imageUrl={siteBranding?.enhaLakPortalImageUrl || siteBranding?.heroImageUrl}
                            icon={<BookOpen size={32} />}
                        />
                        <ProjectCard
                            title={siteContent?.portalPage.creativeWritingTitle || 'بداية الرحلة'}
                            description={siteContent?.portalPage.creativeWritingDescription || "برنامج متكامل لتنمية مهارات الكتابة الإبداعية للأطفال والشباب من 8-18 سنة"}
                            link="/creative-writing"
                            imageUrl={siteBranding?.creativeWritingPortalImageUrl}
                            icon={<Feather size={32} />}
                        />
                    </div>
                </div>
            </section>

            <section className="bg-background py-16 sm:py-20 lg:py-24">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-16">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">رحلتك معنا في 3 خطوات</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative max-w-5xl mx-auto">
                      <HowItWorksStep icon={<Search size={48}/>} title="1. اكتشف" description="تصفح قصصنا المخصصة وبرامجنا الإبداعية المصممة بعناية لتناسب كل طفل."/>
                      <HowItWorksStep icon={<Edit size={48}/>} title="2. خصص" description="أضف لمستك الخاصة. املأ تفاصيل طفلك واختر الأهداف والقيم التي ترغب في غرسها."/>
                      <HowItWorksStep icon={<Gift size={48}/>} title="3. استمتع" description="استلم منتجاً فريداً ومبهراً ينمي شغف طفلك ويطلق العنان لخياله الواسع."/>
                  </div>
              </div>
          </section>

            <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div className="order-last lg:order-first">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                                <Target className="text-primary" /> {siteContent?.portalPage.aboutSectionTitle}
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                {siteContent?.portalPage.aboutSectionContent}
                            </p>
                            <Button as={Link} to="/about" size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                                تعرف علينا أكثر
                            </Button>
                        </div>
                        <div className="relative px-8">
                            <Image src={siteBranding?.aboutImageUrl || ''} alt="عن منصة الرحلة" className="rounded-2xl shadow-2xl aspect-square" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-background py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{siteContent?.portalPage.testimonialsTitle}</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{siteContent?.portalPage.testimonialsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <TestimonialCard
                            quote="قصة 'إنها لك' كانت أفضل هدية لابنتي. رؤية فرحتها وهي ترى نفسها بطلة الحكاية لا تقدر بثمن. شكرًا لكم على هذا الإبداع."
                            author="فاطمة علي"
                            role="ولية أمر"
                        />
                        <TestimonialCard
                            quote="لم أتوقع أن يصبح ابني متحمساً للكتابة بهذا الشكل. البرنامج ساعده على التعبير عن نفسه بثقة وإبداع."
                            author="خالد عبد الرحمن"
                            role="ولي أمر طالب"
                        />
                        <TestimonialCard
                            quote="الجودة والاهتمام بالتفاصيل في المنتجات فاقت توقعاتي. تجربة رائعة من الطلب حتى الاستلام. ابني يطلب قراءة قصته كل ليلة."
                            author="أحمد محمود"
                            role="ولي أمر"
                        />
                    </div>
                </div>
            </section>

            {publishedPosts.length > 0 && (
                <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{siteContent?.portalPage.blogTitle}</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{siteContent?.portalPage.blogSubtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {publishedPosts.slice(0, 3).map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                         <div className="mt-12 text-center">
                            <Link to="/blog" className="inline-flex items-center font-semibold text-lg text-primary hover:text-primary/80 group">
                                <span>قراءة المزيد من المقالات</span>
                                <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                            </Link>
                       </div>
                    </div>
                </section>
            )}

            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{siteContent?.portalPage.finalCtaTitle}</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{siteContent?.portalPage.finalCtaSubtitle}</p>
                   <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button as={Link} to="/enha-lak" size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                            تصفح منتجات "إنها لك"
                        </Button>
                         <Button as={Link} to="/creative-writing/booking" size="lg" variant="secondary" className="shadow-lg transition-transform transform hover:scale-105">
                            احجز جلسة "بداية الرحلة"
                        </Button>
                  </div>
                </div>
            </section>
        </div>
    );
};

export default PortalPage;
