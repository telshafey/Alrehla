import React from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, Gift, Star, ArrowLeft, CheckCircle, Palette, Zap, Send, Mic } from 'lucide-react';
import TestimonialCard from '../components/shared/TestimonialCard';
import ShareButtons from '../components/shared/ShareButtons';
import HowItWorksStep from '../components/shared/HowItWorksStep';
import { Button } from '../components/ui/Button';

const EnhaLakPage: React.FC = () => {
    const pageUrl = window.location.href;

    // Prices are removed from this page. They are available in the store.
    const products = [
        {
            title: "القصة المخصصة",
            features: [
                "تخصيص كامل للبطل: اسم الطفل، صورته، عمره، هواياته",
                "اختيار الهدف التربوي: من 20+ قيمة أساسية",
                "خيارات النشر: نسخة مطبوعة فاخرة أو إلكترونية تفاعلية",
                "رسومات احترافية: مصممة خصيصاً لطفلك",
                "لغة عربية سليمة: تعزز المهارات اللغوية"
            ],
            icon: <BookHeart size={32} className="text-pink-500" />
        },
        {
            title: "دفتر التلوين المخصص",
            features: [
                "رسومات من قصة طفلك الشخصية",
                "20+ صفحة للتلوين والإبداع",
                "جودة طباعة عالية على ورق مقوى",
                "نشاط ممتع ينمي المهارات الحركية"
            ],
            icon: <Palette size={32} className="text-purple-500" />
        },
        {
            title: "كتيّب الأذكار والأدعية",
            features: [
                "رفيق يومي مصور بشخصية طفلك",
                "أدعية وأذكار مختارة ومناسبة للعمر",
                "تصميم جذاب ومحبب للأطفال",
                "يعزز الجانب الروحي والأخلاقي"
            ],
            icon: <Star size={32} className="text-yellow-500" />
        },
        {
            title: "التعليق الصوتي للقصة",
            description: "إعطاء حياة وشخصية للكلمات من خلال الأداء الصوتي للقصص المخصصة والمحتوى الصوتي.",
            features: [
                "أداء صوتي احترافي ومؤثر",
                "مؤثرات صوتية مناسبة للأحداث",
                "ملف صوتي عالي الجودة (MP3)",
                "يمكن إضافته لأي قصة مخصصة"
            ],
            icon: <Mic size={32} className="text-blue-500" />
        },
    ];
    
    const giftBox = {
        title: "بوكس الهدية الكامل",
        features: [
            "القصة المخصصة (نسخة فاخرة)",
            "دفتر التلوين الخاص",
            "كتيب الأذكار والأدعية",
            "تغليف هدايا مميز وفاخر"
        ],
        icon: <Gift size={32} className="text-teal-500" />,
        specialNote: "وفر 300 جنيه مع الباقة الكاملة!"
    };

    const galleryImages = [
        "https://i.ibb.co/8XYt2s5/about-us-image.jpg",
        "https://i.ibb.co/RzJzQhL/hero-image-new.jpg",
        "https://i.ibb.co/n7ZJv9V/child-learning-online.jpg",
        "https://i.ibb.co/C0bSJJT/favicon.png"
    ];


    return (
        <div className="bg-gray-50 animate-fadeIn">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-pink-50 via-red-50 to-white py-16 sm:py-20 lg:py-24 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
                        <span className="text-pink-600">أكثر من مجرد قصة...</span> إنها مغامرة شخصية لطفلك
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
                        مشروع "إنها لك" هو حجر الأساس في منصتنا، حيث نحول الطفل من مجرد قارئ إلى بطل حقيقي يعيش المغامرة بكل تفاصيلها. يرى اسمه، صورته، وشخصيته منسوجة في حكاية ملهمة تبقى معه للأبد.
                    </p>
                    <div className="mt-10">
                        <Button asChild size="lg" variant="pink" className="shadow-lg transition-transform transform hover:scale-105">
                           <Link to="/enha-lak/store">اذهب إلى المتجر وشاهد الأسعار</Link>
                        </Button>
                    </div>
                     <div className="mt-8 flex justify-center">
                        <ShareButtons 
                          title='اكتشف قصص "إنها لك" المخصصة التي تجعل طفلك بطل حكايته'
                          url={pageUrl} 
                          label="شارك المشروع:"
                        />
                    </div>
                </div>
            </section>
            
            {/* Products Section */}
            <section className="py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">ماذا نصنع في "إنها لك"؟</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {products.map(product => (
                            <div key={product.title} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-pink-400">
                                <div className="flex items-center gap-4 mb-4">
                                    {product.icon}
                                    <h3 className="text-2xl font-bold text-gray-800">{product.title}</h3>
                                </div>
                                {product.description && <p className="text-gray-600 mb-4">{product.description}</p>}
                                <ul className="space-y-2 mt-6">
                                    {product.features.map(feature => (
                                        <li key={feature} className="flex items-start gap-3 text-gray-600">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                         <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-teal-400 md:col-span-2">
                            <div className="flex items-center gap-4 mb-4">
                                {giftBox.icon}
                                <h3 className="text-2xl font-bold text-gray-800">{giftBox.title}</h3>
                            </div>
                            <ul className="space-y-2 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                {giftBox.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3 text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                             <div className="mt-4 p-3 bg-green-50 text-green-700 font-bold rounded-lg text-center">
                                {giftBox.specialNote}
                            </div>
                        </div>
                    </div>
                    {/* Subscription Box CTA */}
                    <div className="mt-16 max-w-6xl mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-2xl shadow-xl border-2 border-orange-200">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                            <div className="flex-shrink-0">
                                <Gift size={64} className="text-orange-500"/>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-3xl font-extrabold text-gray-800">جديدنا: صندوق الرحلة الشهري</h3>
                                <p className="mt-2 text-gray-600">هدية متجددة كل شهر، تفتح لطفلك أبواباً جديدة من الخيال والمعرفة. قصة جديدة وأنشطة إبداعية تصل إلى باب منزلك.</p>
                            </div>
                            <div className="flex-shrink-0">
                                <Button asChild size="lg" variant="special">
                                    <Link to="/enha-lak/subscription">اعرف المزيد واشترك الآن</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section className="bg-white py-16 sm:py-20 lg:py-24">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-16">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">خطوات بسيطة لقصة فريدة</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-start relative max-w-6xl mx-auto">
                      <HowItWorksStep icon={<Send size={48} className="text-blue-600"/>} title="1. املأ البيانات" description="اسم الطفل، عمره، صورته، هواياته."/>
                      <HowItWorksStep icon={<CheckCircle size={48} className="text-pink-500"/>} title="2. اختر القيمة" description="حدد الهدف التربوي المطلوب."/>
                      <HowItWorksStep icon={<Zap size={48} className="text-yellow-500"/>} title="3. انتظر السحر" description="فريقنا ينسج قصة مخصصة تماماً."/>
                      <HowItWorksStep icon={<Gift size={48} className="text-green-500"/>} title="4. استلم واستمتع" description="قصة جاهزة في 7-10 أيام عمل."/>
                  </div>
              </div>
          </section>

            {/* Gallery Section */}
            <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">من أعمالنا</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">نماذج من قصص أطفالنا (بعد أخذ إذن أولياء الأمور).</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((src, index) => (
                            <div key={index} className="overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1">
                                <img src={src} alt={`نموذج عمل ${index + 1}`} loading="lazy" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Testimonials Section */}
             <section className="bg-white py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4 text-center">
                     <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">تجارب لا تُنسى من عائلاتنا</h2>
                     <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">آراء نفخر بها من عائلة "الرحلة".</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                        <TestimonialCard
                            quote="قصة 'إنها لك' كانت أفضل هدية لابنتي. رؤية فرحتها وهي ترى نفسها بطلة الحكاية لا تقدر بثمن. شكرًا لكم على هذا الإبداع."
                            author="فاطمة علي"
                            role="ولية أمر"
                        />
                        <TestimonialCard
                            quote="الجودة والاهتمام بالتفاصيل في المنتجات فاقت توقعاتي. تجربة رائعة من الطلب حتى الاستلام. ابني يطلب قراءة قصته كل ليلة."
                            author="أحمد محمود"
                            role="ولي أمر"
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
             <section className="py-20 bg-gradient-to-br from-pink-50 to-red-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">هل أنت مستعد لصناعة السحر؟</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر المنتج الذي يناسب طفلك اليوم واهدِه قصة ستبقى في ذاكرته إلى الأبد.</p>
                    <div className="mt-8">
                        <Button asChild size="lg" variant="pink" icon={<ArrowLeft className="me-3 transform rotate-180" size={22}/>} className="shadow-lg transition-transform transform hover:scale-105">
                            <Link to="/enha-lak/store">
                                ابدأ تخصيص قصتك الآن
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EnhaLakPage;