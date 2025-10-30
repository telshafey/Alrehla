import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowLeft, Calendar, CheckCircle, Sparkles, Star, Globe, Palette, Mic } from 'lucide-react';
import ShareButtons from '../components/shared/ShareButtons';
import TestimonialCard from '../components/shared/TestimonialCard';
import { Button } from '../components/ui/Button';
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


const CreativeWritingPage: React.FC = () => {
  const pageUrl = window.location.href;
  const { data: publicData } = usePublicData();
  const content = publicData?.siteContent?.creativeWritingPage.main;

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
      
      <section className="bg-blue-50 py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">باقات مصممة لكل مبدع</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                  سواء كان طفلك يستكشف الكتابة لأول مرة أو يمتلك موهبة واعدة، لدينا الباقة المثالية التي تناسب مرحلته وتطلق العنان لإمكاناته الكاملة.
              </p>
              <div className="mt-8">
                  <Button asChild size="lg">
                      <Link to="/creative-writing/packages">
                          قارن بين الباقات
                      </Link>
                  </Button>
              </div>
          </div>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">خدمات إبداعية إضافية</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                  هل تحتاج إلى استشارة خاصة، أو مراجعة لنص كتبه طفلك؟ اكتشف خدماتنا الإضافية المصممة لدعم المبدعين الصغار في كل خطوة.
              </p>
              <div className="mt-8">
                  <Button asChild>
                      <Link to="/creative-writing/services">
                          تصفح الخدمات الإبداعية
                      </Link>
                  </Button>
              </div>
          </div>
      </section>

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