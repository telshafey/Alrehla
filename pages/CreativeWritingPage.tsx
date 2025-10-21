import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Book, Users, ArrowLeft, Calendar, CheckCircle, Package, CalendarCheck, Sparkles, Quote, Star, Award, HeartHandshake } from 'lucide-react';
import ShareButtons from '../components/shared/ShareButtons.tsx';
import TestimonialCard from '../components/shared/TestimonialCard.tsx';
import HowItWorksStep from '../components/shared/HowItWorksStep.tsx';

const FeatureCard: React.FC<{ title: string; description: string; link: string; icon: React.ReactNode; }> = ({ title, description, link, icon }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600 flex-grow">{description}</p>
        <Link to={link} className="mt-6 inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
            <span>اعرف المزيد</span>
            <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
        </Link>
    </div>
);

const BenefitCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600">{description}</p>
    </div>
);

const CreativeWritingPage: React.FC = () => {
  const pageUrl = window.location.href;
  const [aboutImageLoaded, setAboutImageLoaded] = useState(false);
  return (
    <div className="bg-gray-50 animate-fadeIn">
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-white py-16 sm:py-20 lg:py-24 text-center">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
                "بداية الرحلة": <span className="text-blue-600">حيث لا تُكتب الكلمات، بل تولد العوالم</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
                "بداية الرحلة" ليس برنامجاً لتعليم الكتابة، بل هو احتفال بالصوت الفريد لكل طفل. إنه المفتاح الذي يفتح أقفال الخيال، والمساحة الآمنة التي تتحول فيها الأفكار الخجولة إلى قصص عظيمة.
            </p>
            <div className="mt-10">
                <Link 
                    to="/creative-writing/booking"
                    className="px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                    اكتشف الباقات وابدأ الآن
                </Link>
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
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">كيف نفعل ذلك؟</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">من خلال حوار ملهم وتمارين إبداعية، نعلم الطفل كيف:</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="px-8 relative">
                    {!aboutImageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl"></div>}
                    <img 
                        src="https://i.ibb.co/8XYt2s5/about-us-image.jpg" 
                        alt="طفلة تكتب وتتعلم" 
                        className={`rounded-2xl shadow-2xl transition-opacity duration-500 ${aboutImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setAboutImageLoaded(true)}
                    />
                </div>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">يصطاد الأفكار</h3>
                            <p className="text-gray-600 mt-1">يحول المشاهدات اليومية إلى بذور لقصص مدهشة.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">يبني العوالم</h3>
                            <p className="text-gray-600 mt-1">يخلق شخصيات تتنفس وتعيش في عوالم من صنعه.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">يرسم بالكلمات</h3>
                            <p className="text-gray-600 mt-1">يستخدم اللغة كفرشاة ليرسم الصور والمشاعر في عقل القارئ.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">يحرر صوته</h3>
                            <p className="text-gray-600 mt-1">يعبر عن نفسه بثقة، ويكتشف أن كلماته قادرة على إحداث تغيير.</p>
                        </div>
                    </div>
                </div>
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
                    icon={<Award size={32} />}
                    title="الثقة للتعبير"
                    description="يصبح أكثر جرأة في مشاركة أفكاره ومشاعره."
                  />
                  <BenefitCard 
                    icon={<HeartHandshake size={32} />}
                    title="صديق جديد"
                    description="تصبح الكتابة متنفسًا له، ووسيلة لفهم نفسه والعالم من حوله."
                  />
                  <BenefitCard 
                    icon={<Sparkles size={32} />}
                    title="قوة الإبداع"
                    description="يدرك أنه ليس مجرد متلقٍ للقصص، بل هو صانع لها."
                  />
              </div>
          </div>
      </section>
      
        <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">رحلتنا في 3 خطوات بسيطة</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative">
                  <div className="hidden md:block absolute top-12 left-0 right-0 w-full h-1" style={{zIndex: 0}}>
                      <svg width="100%" height="4" viewBox="0 0 100 4" preserveAspectRatio="none">
                          <line x1="16.66%" y1="2" x2="83.33%" y2="2" stroke="#a0baf2" strokeWidth="3" strokeDasharray="8 8"/>
                      </svg>
                  </div>
                  <div className="z-10"><HowItWorksStep icon={<Package size={48} className="text-blue-600"/>} title="1. اختر الباقة" description="تصفح باقاتنا واختر ما يناسب مستوى طفلك وأهدافك، ويمكنك أيضاً اختيار مدربك المفضل."/></div>
                  <div className="z-10"><HowItWorksStep icon={<CalendarCheck size={48} className="text-pink-500"/>} title="2. احجز الموعد" description="اختر اليوم والوقت المناسبين لك من خلال تقويم المواعيد المتاح لكل مدرب."/></div>
                  <div className="z-10"><HowItWorksStep icon={<Sparkles size={48} className="text-green-500"/>} title="3. ابدأ الإبداع" description="انضم إلى الجلسات الفردية المباشرة وابدأ رحلة طفلك في عالم الكتابة الإبداعية."/></div>
              </div>
          </div>
      </section>


      <section className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">استكشف رحلتنا الإبداعية</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">تعمق في تفاصيل برنامجنا المصمم بعناية لصقل موهبة طفلك.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    title="عن البرنامج"
                    description="اكتشف رؤيتنا وأهدافنا التعليمية والتربوية التي تشكل أساس برنامجنا."
                    link="/creative-writing/about"
                    icon={<Target size={32} />}
                />
                    <FeatureCard
                    title="المنهج الدراسي"
                    description="تعرف على المراحل التعليمية والمخرجات التي سيحصل عليها طفلك في نهاية الرحلة."
                    link="/creative-writing/curriculum"
                    icon={<Book size={32} />}
                />
                    <FeatureCard
                    title="المدربون"
                    description="قابل فريقنا من المدربين المتخصصين والمستعدين لإلهام وتوجيه طفلك."
                    link="/creative-writing/instructors"
                    icon={<Users size={32} />}
                />
            </div>
            </div>
      </section>

       <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
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
                    <Link to="/creative-writing/booking" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                        <Calendar className="me-3" size={22}/>
                        عرض الباقات وحجز موعد
                    </Link>
                </div>
            </div>
        </section>
        
    </div>
  );
};

export default CreativeWritingPage;