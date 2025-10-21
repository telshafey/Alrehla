import React from 'react';
import { Eye, BookHeart, Feather, CheckCircle } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext.tsx';
import PageLoader from '../components/ui/PageLoader.tsx';
import ShareButtons from '../components/shared/ShareButtons.tsx';

// A small reusable component for benefit points
const BenefitCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full text-right">
        <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);


const AboutPage: React.FC = () => {
    // We still need the branding for the image, but not the text content from useAdminData
    const { siteBranding, loading: isBrandingLoading } = useProduct();
    const pageUrl = window.location.href;

    if (isBrandingLoading) {
        return <PageLoader />;
    }

    return (
        <div className="bg-white animate-fadeIn">
            {/* Hero Section */}
            <section className="bg-blue-50 py-20 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">رحلة كل طفل تبدأ بقصة</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        نؤمن في منصة الرحلة أن كل طفل هو بطل حكايته. لذلك، نصنع بحب وشغف قصصاً ومنتجات تربوية مخصصة، تكون مرآةً تعكس شخصية الطفل، وتعزز هويته، وتغرس فيه أسمى القيم.
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

            {/* Who We Are */}
            <section className="py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-last md:order-first">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">من نحن؟</h2>
                            <p className="text-gray-600 leading-relaxed">
                                منصة الرحلة هي منظومة تربوية إبداعية متكاملة، صُممت لتكون الرفيق الأمين لكل طفل في رحلته نحو اكتشاف ذاته، انطلاقاً من قصص 'إنها لك' التي تجعله بطلاً، وصولاً إلى برنامج 'بداية الرحلة' الذي يمكّنه من صناعة عوالمه الخاصة.
                            </p>
                        </div>
                        <div>
                            <img src={siteBranding?.aboutImageUrl || "https://i.ibb.co/8XYt2s5/about-us-image.jpg"} alt="طفلة تقرأ وتتعلم بشغف" className="rounded-2xl shadow-xl" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Enha Lak Section */}
            <section className="bg-gray-50 py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <BookHeart className="mx-auto h-16 w-16 text-pink-500 mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-800">مشروع 'إنها لك'</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        هو حجر الأساس في منصتنا، حيث نصنع قصصاً مخصصة ومنتجات تربوية فريدة. الطفل لا يقرأ قصة، بل يعيشها، يرى اسمه، صورته، وتفاصيله منسوجة في حكاية ملهمة.
                    </p>
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-800 mb-8">رسالتنا: أكثر من مجرد قصة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <BenefitCard 
                                icon={<CheckCircle/>}
                                title="تعزيز الهوية"
                                description="نحول الطفل من قارئ إلى بطل، مما يعزز صورته الذاتية الإيجابية."
                            />
                             <BenefitCard 
                                icon={<CheckCircle/>}
                                title="بناء الثقة بالنفس"
                                description="رؤية نفسه ناجحًا في القصة يمنحه الشجاعة لمواجهة تحديات الواقع."
                            />
                             <BenefitCard 
                                icon={<CheckCircle/>}
                                title="غرس القيم"
                                description="نقدم المفاهيم التربوية في سياق قصصي محبب ومؤثر يتقبله الطفل بسهولة."
                            />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Bidayat Alrehla Section */}
             <section className="bg-white py-16 sm:py-20">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <Feather className="mx-auto h-16 w-16 text-purple-500 mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-800">برنامج 'بداية الرحلة'</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                       هو برنامج متكامل لتنمية مهارات الكتابة الإبداعية لدى الأطفال والشباب. في بيئة رقمية آمنة وملهمة، وبإشراف مدربين متخصصين، نأخذ بيد المبدعين الصغار ليصقلوا مواهبهم.
                    </p>
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-800 mb-8">منهجيتنا: الإلهام قبل القواعد</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <BenefitCard 
                                icon={<CheckCircle/>}
                                title="جلسات فردية مباشرة"
                                description="تركيز كامل على صوت الطفل واحتياجاته الإبداعية الفريدة."
                            />
                             <BenefitCard 
                                icon={<CheckCircle/>}
                                title="بيئة آمنة وداعمة"
                                description="مساحة خالية من النقد، تشجع على التجربة والخطأ كجزء من عملية التعلم."
                            />
                             <BenefitCard 
                                icon={<CheckCircle/>}
                                title="مخرجات ملموسة"
                                description="ينهي الطالب البرنامج بمحفظة أعمال رقمية وشهادة إتمام، مما يمنحه شعورًا بالإنجاز."
                            />
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
                       أن نكون الوجهة الأولى لكل أسرة عربية تبحث عن محتوى تربوي إبداعي وأصيل ينمّي شخصية الطفل، يعزز ارتباطه بلغته وهويته، ويطلق العنان لخياله.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;