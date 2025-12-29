
import React, { useMemo } from 'react';
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

const HeroSection: React.FC<{ backgroundUrl: string | null | undefined; content: any }> = ({ backgroundUrl, content }) => (
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
                    {content?.heroButtonText1 || "اطلب قصتك المخصصة الآن"}
                </Button>
                <Button as={Link} to="/creative-writing" size="lg" variant="secondary" className="shadow-lg transition-transform transform hover:scale-105">
                    {content?.heroButtonText2 || "اكتشف برنامج الكتابة الإبداعية"}
                </Button>
            </div>
        </div>
    </section>
);

// Color mapping to ensure Tailwind classes are purge-safe
const themeClasses: Record<string, { text: string, bg: string }> = {
    pink: { text: 'text-pink-600', bg: 'text-pink-600' },
    blue: { text: 'text-blue-600', bg: 'text-blue-600' },
};

const ProjectCard: React.FC<{ title: string; description: string; link: string; imageUrl: string | null | undefined; icon: React.ReactNode; btnText: string; themeColor: 'pink' | 'blue' }> = ({ title, description, link, imageUrl, icon, btnText, themeColor }) => {
    const colorClass = themeClasses[themeColor]?.text || 'text-primary';
    
    return (
        <Link to={link} className="group flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Image Container */}
            <div className="relative h-64 sm:h-72 overflow-hidden">
                <Image 
                    src={imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                {/* Floating Icon */}
                <div className={`absolute -bottom-6 right-8 w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg bg-white ${colorClass} z-10 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {icon}
                </div>
            </div>
            
            {/* Content Container */}
            <div className="p-8 pt-10 flex flex-col flex-grow">
                <h3 className="text-2xl font-extrabold text-foreground mb-3 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3 flex-grow">{description}</p>
                
                <div className={`flex items-center font-bold ${colorClass} mt-auto group-hover:underline`}>
                    <span>{btnText}</span>
                    <ArrowLeft size={20} className="ms-2 transition-transform group-hover:-translate-x-2 rtl:group-hover:translate-x-2" />
                </div>
            </div>
        </Link>
    );
};

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
    const { blogPosts, siteContent, personalizedProducts = [] } = data || {};

    // الحصول على صور المشاريع من المنتجات المخصصة لضمان المزامنة
    const customStoryImg = useMemo(() => personalizedProducts.find(p => p.key === 'custom_story')?.image_url, [personalizedProducts]);
    const subBoxImg = useMemo(() => personalizedProducts.find(p => p.key === 'subscription_box')?.image_url, [personalizedProducts]);

    if (productLoading || publicDataLoading) {
        return <PageLoader text="جاري تجهيز الصفحة الرئيسية..." />;
    }

    const publishedPosts = blogPosts || [];
    const content = siteContent?.portalPage;
    
    return (
        <div className="bg-background animate-fadeIn">
            <HeroSection backgroundUrl={siteBranding?.heroImageUrl} content={content} />
            
            {content?.showProjectsSection !== false && (
                <section className="bg-muted/30 py-20 sm:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">{content?.projectsTitle || "أقسامنا الرئيسية"}</h2>
                            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">{content?.projectsSubtitle || "بوابتان لعالم من الإبداع والنمو"}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                            <ProjectCard
                                title={content?.enhaLakTitle || 'إنها لك'}
                                description={content?.enhaLakDescription || "قصص مخصصة ومنتجات تربوية فريدة تجعل طفلك بطلاً."}
                                link="/enha-lak"
                                imageUrl={customStoryImg || siteBranding?.enhaLakPortalImageUrl} 
                                icon={<BookOpen size={32} />}
                                btnText={content?.enhaLakBtnText || "اكتشف القصص"}
                                themeColor="pink"
                            />
                            <ProjectCard
                                title={content?.creativeWritingTitle || 'بداية الرحلة'}
                                description={content?.creativeWritingDescription || "برنامج متكامل لتنمية مهارات الكتابة الإبداعية."}
                                link="/creative-writing"
                                imageUrl={siteBranding?.creativeWritingPortalImageUrl} 
                                icon={<Feather size={32} />}
                                btnText={content?.creativeWritingBtnText || "ابدأ الرحلة"}
                                themeColor="blue"
                            />
                        </div>
                    </div>
                </section>
            )}

            {content?.showStepsSection !== false && (
                <section className="bg-background py-20 sm:py-24">
                  <div className="container mx-auto px-4">
                      <div className="text-center mb-16">
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{content?.stepsTitle || "رحلتك معنا في 3 خطوات"}</h2>
                      </div>
                      {content?.steps ? (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative max-w-5xl mx-auto">
                                {content.steps.map((step: any, idx: number) => (
                                    <HowItWorksStep 
                                        key={idx}
                                        icon={idx === 0 ? <Search size={48}/> : idx === 1 ? <Edit size={48}/> : <Gift size={48}/>} 
                                        title={step.title} 
                                        description={step.description}
                                    />
                                ))}
                           </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative max-w-5xl mx-auto">
                              <HowItWorksStep icon={<Search size={48}/>} title="1. اكتشف" description="تصفح قصصنا المخصصة وبرامجنا الإبداعية المصممة بعناية لتناسب كل طفل."/>
                              <HowItWorksStep icon={<Edit size={48}/>} title="2. خصص" description="أضف لمستك الخاصة. املأ تفاصيل طفلك واختر الأهداف والقيم التي ترغب في غرسها."/>
                              <HowItWorksStep icon={<Gift size={48}/>} title="3. استمتع" description="استلم منتجاً فريداً ومبهراً ينمي شغف طفلك ويطلق العنان لخياله الواسع."/>
                          </div>
                      )}
                  </div>
              </section>
            )}

            {content?.showAboutSection !== false && (
                <section className="bg-muted/30 py-20 sm:py-24">
                    <div className="container mx-auto px-4">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                            <div className="order-last lg:order-first">
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                                    <Target className="text-primary" /> {content?.aboutSectionTitle || "قصتنا: من فكرة إلى رحلة"}
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                    {content?.aboutSectionContent || "نحن منصة تسعى لتمكين الأطفال من خلال القصص والكتابة..."}
                                </p>
                                <Button as={Link} to="/about" size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                                    {content?.aboutBtnText || "تعرف علينا أكثر"}
                                </Button>
                            </div>
                            <div className="relative px-4 sm:px-8">
                                <Image src={siteBranding?.aboutPortalImageUrl || 'https://placehold.co/600x600'} alt="عن منصة الرحلة" className="rounded-3xl shadow-2xl aspect-square rotate-3 hover:rotate-0 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {content?.showTestimonialsSection !== false && (
                <section className="bg-background py-20 sm:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{content?.testimonialsTitle || "ماذا تقول عائلاتنا؟"}</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{content?.testimonialsSubtitle || "آراء نفخر بها"}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            <TestimonialCard
                                quote="قصة 'إنها لك' كانت أفضل هدية لابنتي. رؤية فرحتها وهي ترى نفسها بطلة الحكاية لا تقدر بثمن."
                                author="فاطمة علي"
                                role="ولية أمر"
                            />
                            <TestimonialCard
                                quote="لم أتوقع أن يصبح ابني متحمساً للكتابة بهذا الشكل. البرنامج ساعده على التعبير عن نفسه بثقة وإبداع."
                                author="خالد عبد الرحمن"
                                role="ولي أمر طالب"
                            />
                            <TestimonialCard
                                quote="الجودة والاهتمام بالتفاصيل في المنتجات فاقت توقعاتي. تجربة رائعة من الطلب حتى الاستلام."
                                author="أحمد محمود"
                                role="ولي أمر"
                            />
                        </div>
                    </div>
                </section>
            )}

            {content?.showBlogSection !== false && publishedPosts.length > 0 && (
                <section className="bg-muted/30 py-20 sm:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{content?.blogTitle || "من مدونتنا"}</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{content?.blogSubtitle || "مقالات ونصائح تربوية"}</p>
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

            {content?.showFinalCtaSection !== false && (
                <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="container mx-auto px-4 text-center">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{content?.finalCtaTitle || "هل أنت جاهز لبدء الرحلة؟"}</h2>
                      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{content?.finalCtaSubtitle || "اختر المسار الذي يناسب طفلك اليوم"}</p>
                       <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button as={Link} to="/enha-lak" size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                                {content?.finalCtaBtn1 || "تصفح منتجات 'إنها لك'"}
                            </Button>
                             <Button as={Link} to="/creative-writing/booking" size="lg" variant="secondary" className="shadow-lg transition-transform transform hover:scale-105">
                                {content?.finalCtaBtn2 || "احجز جلسة 'بداية الرحلة'"}
                            </Button>
                      </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default PortalPage;
