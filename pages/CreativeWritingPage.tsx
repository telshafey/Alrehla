import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowLeft, Calendar, CheckCircle, Sparkles, Star, Globe, Palette, Mic, ChevronDown, Loader2, MessageSquare, FileCheck, Award, BookUp } from 'lucide-react';
import ShareButtons from '../components/shared/ShareButtons';
import TestimonialCard from '../components/shared/TestimonialCard';
import { Button } from '../components/ui/Button';
import type { CreativeWritingPackage, AdditionalService } from '../lib/database.types';
import { useBookingData } from '../hooks/queries/public/usePageDataQuery';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';


const BenefitCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 h-full">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600">{description}</p>
    </div>
);

const PackageAccordion: React.FC<{ pkg: CreativeWritingPackage }> = ({ pkg }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isFree = pkg.price === 0;

    return (
        <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-2xl' : 'shadow-lg'} ${pkg.popular ? 'border-blue-500 bg-blue-50' : (isFree ? 'border-green-500 bg-green-50' : 'bg-white border-gray-200')}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-right flex justify-between items-center"
            >
                <div className="flex-grow">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{pkg.name}</h3>
                        {pkg.popular && <span className="text-xs font-bold bg-blue-500 text-white px-3 py-1 rounded-full hidden sm:inline-block">الأكثر شيوعاً</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{pkg.sessions}</p>
                </div>
                <div className="text-left flex-shrink-0 ml-4">
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-800">{isFree ? 'مجانية' : `${pkg.price} ج.م`}</p>
                </div>
                <ChevronDown className={`w-8 h-8 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-500' : ''}`} />
            </button>
            <div className={`grid overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-6">
                        <p className="text-gray-600 border-t pt-4">{pkg.description}</p>
                        <ul className="space-y-2 text-gray-600">
                            {pkg.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button asChild variant={isFree ? 'success' : 'primary'} size="md">
                            <Link to="/creative-writing/booking">
                                {isFree ? 'ابدأ جلستك المجانية' : 'اختر هذه الباقة'}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const InstructorShowcaseCard: React.FC<{ name: string; specialty: string; points: string[]; avatar: string; }> = ({ name, specialty, points, avatar }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg text-center border h-full">
        <img src={avatar} alt={name} className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-blue-100" />
        <h4 className="text-xl font-bold mt-4">{name}</h4>
        <p className="text-blue-600 font-semibold text-sm mb-4">{specialty}</p>
        <ul className="text-sm text-gray-600 space-y-2 text-right">
            {points.map((point, i) => <li key={i} className="flex items-start gap-2"><Star size={14} className="text-yellow-400 mt-1 flex-shrink-0" /><span>{point}</span></li>)}
        </ul>
    </div>
);

const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, price: string, description: string }> = ({ icon, title, price, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border h-full transform hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">{icon}</div>
            <div>
                <h4 className="text-lg font-bold text-gray-800">{title}</h4>
                <p className="font-bold text-purple-600">{price}</p>
            </div>
        </div>
        <p className="mt-2 text-gray-600 text-sm">{description}</p>
    </div>
);


const CreativeWritingPage: React.FC = () => {
  const pageUrl = window.location.href;
  const { data: bookingData, isLoading: bookingDataLoading } = useBookingData();
  const { data: publicData, isLoading: publicDataLoading } = usePublicData();
  const isLoading = bookingDataLoading || publicDataLoading;

  const packages = bookingData?.cw_packages || [];
  const services = bookingData?.cw_services || [];
  const content = publicData?.siteContent?.creativeWritingPage.main;

  const serviceIcons: { [key: string]: React.ReactNode } = {
    'استشارة خاصة': <MessageSquare />,
    'مراجعة نص': <FileCheck />,
    'الاشتراك بعمل في الاصدار القادم': <Award />,
    'طلب اصدار خاص': <BookUp />,
  };

  const methodologyPoints = [
      { icon: <Target className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />, title: "يصطاد الأفكار", description: "يحول المشاهدات اليومية إلى بذور قصص مدهشة." },
      { icon: <Globe className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />, title: "يبني العوالم", description: "يخلق شخصيات تتنفس وتعيش في عوالم من صنعه." },
      { icon: <Palette className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />, title: "يرسم بالكلمات", description: "يستخدم اللغة كفرشاة ليرسم الصور والمشاعر." },
      { icon: <Mic className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />, title: "يحرر صوته", description: "يعبر عن نفسه بثقة، ويكتشف قوة كلماته." },
  ];

  return (
    <div className="bg-gray-50 animate-fadeIn">
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-white py-16 sm:py-20 lg:py-24 text-center">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
               {content?.heroTitle.split(':')[0]}: <span className="text-blue-600">{content?.heroTitle.split(':')[1]}</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
                {content?.heroSubtitle}
            </p>
            <div className="mt-10">
                <Button asChild size="lg" className="shadow-lg transition-transform transform hover:scale-105">
                    <Link to="/creative-writing/booking">
                        اكتشف الباقات وابدأ الآن
                    </Link>
                </Button>
            </div>
            <div className="mt-8 flex justify-center">
                <ShareButtons 
                  title='اكتشف برنامج "بداية الرحلة" للكتابة الإبداعية وصقل موهبة طفلك' 
                  url={pageUrl} 
                  label="شارك البرنامج:"
                />
            </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">{content?.methodologyTitle}</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">كيف نطلق الإبداع؟</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {methodologyPoints.map(point => (
                    <div key={point.title} className="flex items-start gap-4 p-6 bg-white rounded-2xl border shadow-lg">
                        {point.icon}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{point.title}</h3>
                            <p className="text-gray-600 mt-1">{point.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">التحول الذي نصنعه</h2>
                   <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">مع نهاية الرحلة، لا يحصل طفلك على مجرد نصوص مكتوبة، بل يحصل على ما هو أثمن:</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <BenefitCard 
                    icon={<Sparkles size={32} />}
                    title="الثقة للتعبير"
                    description="يصبح أكثر جرأة في مشاركة أفكاره ومشاعره."
                  />
                  <BenefitCard 
                    icon={<Star size={32} />}
                    title="صديق جديد"
                    description="تصبح الكتابة متنفسًا له، ووسيلة لفهم نفسه والعالم من حوله."
                  />
                  <BenefitCard 
                    icon={<Target size={32} />}
                    title="قوة الإبداع"
                    description="يدرك أنه ليس مجرد متلقٍ للقصص، بل هو صانع لها."
                  />
              </div>
          </div>
      </section>
      
      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">باقاتنا المرنة</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر الباقة التي تناسب رحلة طفلك الإبداعية.</p>
            </div>
            <div className="space-y-4 max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
                    </div>
                ) : (
                    packages.map(pkg => <PackageAccordion key={pkg.id} pkg={pkg} />)
                )}
            </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">خدمات إضافية لتجربة متكاملة</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">عزز رحلة طفلك الإبداعية بخدمات متخصصة.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {services.map((service: AdditionalService) => (
                        <ServiceCard
                            key={service.id}
                            icon={serviceIcons[service.name] || <Sparkles />}
                            title={service.name}
                            price={`${service.price} ج.م`}
                            description={service.description || ''}
                        />
                    ))}
                </div>
            </div>
        </section>
      )}

      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">مدربونا المتخصصون</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">نخبة من الخبراء الشغوفين بإلهام العقول المبدعة.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <InstructorShowcaseCard name="أ. نورة القحطاني" specialty="متخصصة في السرد القصصي (8-12 سنة)" points={["ماجستير في أدب الأطفال", "8 سنوات خبرة في التدريب", "أسلوب تفاعلي محبب"]} avatar="https://i.ibb.co/yY3GJk1/female-avatar.png" />
                <InstructorShowcaseCard name="أ. أحمد المصري" specialty="متخصص في بناء العوالم (13-18 سنة)" points={["كاتب وروائي منشور", "خبير في الأدب الفانتازي", "مدرب معتمد في الكتابة"]} avatar="https://i.ibb.co/2S4xT8w/male-avatar.png" />
                <InstructorShowcaseCard name="أ. فاطمة الزهراء" specialty="متخصصة في تنمية الخيال" points={["دكتوراه في التربية الإبداعية", "مؤلفة 15+ كتاب للأطفال", "محاضرة دولية في الإبداع"]} avatar="https://i.ibb.co/yY3GJk1/female-avatar.png" />
                <InstructorShowcaseCard name="أ. تامر محمد" specialty="متخصص في إلهام المبدعين الصغار" points={["رئيس تحرير مجلة أطفال", "12 سنة في مجال الكتابة", "خبير في محتوى الوسائط الرقمية"]} avatar="https://i.ibb.co/2S4xT8w/male-avatar.png" />
            </div>
             <div className="mt-12 text-center">
                <Link to="/creative-writing/instructors" className="inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
                    <span>عرض كل المدربين</span>
                    <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </Link>
           </div>
            </div>
      </section>

       <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">آراء أولياء الأمور</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">تجارب حقيقية من عائلات انضمت لبرنامج "بداية الرحلة".</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <TestimonialCard
                      quote="لم أتوقع أن يصبح ابني متحمساً للكتابة بهذا الشكل. البرنامج ساعده على التعبير عن نفسه بثقة وإبداع. شكراً للمدرب على جهوده الرائعة."
                      author="خالد عبد الرحمن"
                      role="ولي أمر طالب"
                  />
                  <TestimonialCard
                      quote="البرنامج أكثر من رائع! الجلسات فردية والتركيز على ابنتي كان كاملاً. لاحظت تطوراً كبيراً في أسلوبها وقدرتها على تنظيم أفكارها."
                      author="مريم العلي"
                      role="ولية أمر طالبة"
                  />
              </div>
          </div>
      </section>

        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">هل أنت جاهز لبدء الرحلة؟</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر الباقة التي تناسب طفلك اليوم وافتح له بابًا جديدًا من الإبداع والتعبير.</p>
                <div className="mt-8">
                     <Button asChild size="lg" icon={<Calendar className="me-3" size={22}/>} className="shadow-lg transition-transform transform hover:scale-105">
                        <Link to="/creative-writing/booking">
                           عرض الباقات وحجز موعد
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
        
    </div>
  );
};

export default CreativeWritingPage;