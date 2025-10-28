import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Feather, Target, ArrowLeft } from 'lucide-react';
// FIX: Corrected import paths
import { useProduct } from '../contexts/ProductContext';
import { usePublicData } from '../hooks/publicQueries';
import TestimonialCard from '../components/shared/TestimonialCard';
import PostCard from '../components/shared/PostCard';
import PageLoader from '../components/ui/PageLoader';
import { Button } from '../components/ui/Button';

// --- Hero Section ---
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
                <Button asChild size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                    <Link to="/enha-lak/store">اطلب قصتك المخصصة الآن</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="shadow-lg transition-transform transform hover:scale-105">
                    <Link to="/creative-writing">اكتشف برنامج الكتابة الإبداعية</Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="bg-white text-gray-700 border-gray-300 shadow-lg transition-transform transform hover:scale-105">
                    <Link to="/">جرّب المنصة مجاناً</Link>
                </Button>
            </div>
        </div>
    </section>
);

// --- Projects Section ---
const ProjectCard: React.FC<{ title: string; description: string; link: string; imageUrl: string | null; icon: React.ReactNode; }> = ({ title, description, link, imageUrl, icon }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 border">
            <div className="relative h-64 bg-gray-200">
                {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>}
                <img src={imageUrl || ''} alt={title} className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy" onLoad={() => setImageLoaded(true)} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors"></div>
                <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-sm text-blue-600 p-4 rounded-full shadow-lg">
                    {icon}
                </div>
            </div>
            <div className="p-8">
                <h3 className="text-3xl font-extrabold text-gray-800">{title}</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">{description}</p>
                <Link to={link} className="mt-6 inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
                    <span>اعرف المزيد</span>
                    <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
};

const ProjectsSection: React.FC<{ branding: any; content: any }> = ({ branding, content }) => (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أقسامنا الرئيسية</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">بوابتان لعالم من الإبداع والنمو، مصممتان لتلبية احتياجات طفلك الفريدة.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <ProjectCard
                    title={content?.enhaLakTitle || 'إنها لك'}
                    description={content?.enhaLakDescription || "قصص مخصصة ومنتجات تربوية فريدة تجعل طفلك بطل الحكاية الحقيقي"}
                    link="/enha-lak"
                    imageUrl={branding?.heroImageUrl}
                    icon={<BookOpen size={32} />}
                />
                <ProjectCard
                    title={content?.creativeWritingTitle || 'بداية الرحلة'}
                    description={content?.creativeWritingDescription || "برنامج متكامل لتنمية مهارات الكتابة الإبداعية للأطفال والشباب من 8-18 سنة"}
                    link="/creative-writing"
                    imageUrl={branding?.creativeWritingPortalImageUrl}
                    icon={<Feather size={32} />}
                />
            </div>
        </div>
    </section>
);


// --- Value Proposition Section ---
const ValuePropositionSection: React.FC<{ content: any }> = ({ content }) => {
    const features = [
        { icon: '✨', text: 'محتوى عربي أصيل يعزز الهوية والانتماء الثقافي' },
        { icon: '🎭', text: 'تخصيص كامل: طفلك هو بطل القصة باسمه وصورته الحقيقية' },
        { icon: '👨‍🏫', text: 'برنامج تدريبي فردي مع مدربين متخصصين في الأدب والتربية' },
        { icon: '📚', text: 'منتجات تربوية شاملة (قصص، تلوين، أدعية، ألعاب)' },
        { icon: '🔬', text: 'منهجية علمية تجمع بين المتعة والتطوير الفعلي' },
    ];

    return (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">{content?.valuePropositionTitle || "لماذا منصة الرحلة هي الأفضل لطفلك؟"}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border transform hover:scale-105 hover:shadow-lg transition-transform">
                            <span className="text-3xl mt-1">{feature.icon}</span>
                            <p className="text-lg text-gray-700 font-semibold">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


// --- Social Proof Section ---
const SocialProofSection: React.FC = () => {
    const stats = [
        { icon: '📖', value: '1000+', label: 'قصة مخصصة تم إنتاجها' },
        { icon: '👦', value: '500+', label: 'طالب مبدع في برامجنا' },
        { icon: '🎓', value: '20+', label: 'مدرب محترف متخصص' },
        { icon: '⭐', value: '98%', label: 'معدل رضا العملاء' },
    ];
    return (
        <section className="bg-blue-50 py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <span className="text-4xl">{stat.icon}</span>
                            <p className="text-4xl font-extrabold text-blue-600 mt-2">{stat.value}</p>
                            <p className="text-md font-semibold text-gray-600 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


// --- About Section ---
const AboutSection: React.FC<{ branding: any; content: any }> = ({ branding, content }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <div className="order-last lg:order-first">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
                            <Target className="text-blue-500" /> قصتنا
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8">
                            {content?.ourStory || "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة 'منصة الرحلة' - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي."}
                        </p>
                        <Button asChild size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                            <Link to="/about">تعرف علينا أكثر</Link>
                        </Button>
                    </div>
                    <div className="relative px-8">
                        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl"></div>}
                        <img src={branding?.aboutImageUrl || ''} alt="عن منصة الرحلة" className={`rounded-2xl shadow-2xl transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy" onLoad={() => setImageLoaded(true)} />
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Testimonials Section ---
const TestimonialsSection: React.FC = () => (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">ماذا تقول عائلاتنا؟</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">آراء نفخر بها من عائلة "الرحلة".</p>
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
);


// --- Blog Section ---
const BlogSection: React.FC<{ posts: any[] }> = ({ posts }) => (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">من مدونتنا</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">مقالات ونصائح تربوية وإبداعية لمساعدتكم في رحلة تنمية أطفالكم.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {posts.slice(0, 3).map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
             <div className="mt-12 text-center">
                <Link to="/blog" className="inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
                    <span>قراءة المزيد من المقالات</span>
                    <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </Link>
           </div>
        </div>
    </section>
);


// --- Final CTA Section ---
const FinalCtaSection: React.FC = () => (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">هل أنت جاهز لبدء الرحلة؟</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر المسار الذي يناسب طفلك اليوم وافتح له بابًا جديدًا من الخيال والمعرفة.</p>
           <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                    <Link to="/enha-lak">تصفح منتجات "إنها لك"</Link>
                </Button>
                 <Button asChild size="lg" variant="secondary" className="shadow-lg transition-transform transform hover:scale-105">
                    <Link to="/creative-writing/booking">احجز جلسة "بداية الرحلة"</Link>
                </Button>
          </div>
        </div>
      </section>
);


// --- Main Portal Page Component ---
const PortalPage: React.FC = () => {
    const { siteBranding, loading: productLoading } = useProduct();
    const { data, isLoading: publicDataLoading } = usePublicData();
    const { blogPosts, siteContent } = data || {};

    if (productLoading || publicDataLoading) {
        return <PageLoader text="جاري تجهيز الصفحة الرئيسية..." />;
    }

    const publishedPosts = blogPosts || [];
    
    return (
        <div className="bg-white animate-fadeIn">
            <HeroSection backgroundUrl={siteBranding?.heroImageUrl} content={siteContent?.portalPage} />
            <ProjectsSection branding={siteBranding} content={siteContent?.portalPage} />
            <ValuePropositionSection content={siteContent?.portalPage} />
            <SocialProofSection />
            <AboutSection branding={siteBranding} content={siteContent?.aboutPage} />
            <TestimonialsSection />
            {publishedPosts.length > 0 && <BlogSection posts={publishedPosts} />}
            <FinalCtaSection />
        </div>
    );
};

export default PortalPage;
