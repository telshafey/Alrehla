import React from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, Gift, Star, ArrowLeft } from 'lucide-react';
import TestimonialCard from '../components/shared/TestimonialCard.tsx';
import ShareButtons from '../components/shared/ShareButtons.tsx';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 h-full">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 text-pink-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600">{description}</p>
    </div>
);


const EnhaLakPage: React.FC = () => {
    const pageUrl = window.location.href;

    return (
        <div className="bg-gray-50 animate-fadeIn">
            <section className="bg-gradient-to-br from-pink-50 via-red-50 to-white py-16 sm:py-20 lg:py-24 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
                        قصص "إنها لك": <span className="text-pink-600">عندما يصبح طفلك بطلاً</span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
                        في "إنها لك"، نحن لا نكتب قصصًا للأطفال، بل نكتب قصصًا عنهم. تجربة فريدة يرى فيها طفلك اسمه وصورته وتفاصيله منسوجة في حكاية ملهمة، مصممة خصيصًا له.
                    </p>
                    <div className="mt-10">
                        <Link 
                            to="/enha-lak/store"
                            className="px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-lg">
                            اكتشف منتجاتنا السحرية
                        </Link>
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
            
            <section className="py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لماذا "إنها لك"؟</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">لأننا نؤمن أن كل طفل يستحق أن يرى نفسه بطلاً. منتجاتنا أكثر من مجرد هدية، إنها استثمار في بناء شخصية طفلك.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard 
                            icon={<BookHeart size={32} />}
                            title="تعزيز الهوية"
                            description="عندما يقرأ الطفل قصة بطله هو، يزداد شعوره بقيمته الذاتية ويتعزز ارتباطه بلغته وهويته."
                        />
                         <FeatureCard 
                            icon={<Star size={32} />}
                            title="بناء الثقة بالنفس"
                            description="رؤية نفسه ينجح ويتغلب على التحديات في القصة تمنحه الشجاعة لمواجهة تحديات الواقع."
                        />
                         <FeatureCard 
                            icon={<Gift size={32} />}
                            title="غرس القيم"
                            description="نقدم المفاهيم التربوية والأخلاقية في سياق قصصي محبب ومؤثر يتقبله الطفل بسهولة."
                        />
                    </div>
                </div>
            </section>

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

             <section className="py-20 bg-gradient-to-br from-pink-50 to-red-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">هل أنت مستعد لصناعة السحر؟</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر المنتج الذي يناسب طفلك اليوم واهدِه قصة ستبقى في ذاكرته إلى الأبد.</p>
                    <div className="mt-8">
                        <Link to="/enha-lak/store" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-lg">
                           <ArrowLeft className="me-3 transform rotate-180" size={22}/>
                            ابدأ تخصيص قصتك الآن
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EnhaLakPage;
