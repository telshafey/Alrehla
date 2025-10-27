import React, { useState } from 'react';
import { Target, Star, Eye, Shield, Users, CheckCircle, PenTool } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="mt-1 text-gray-600 leading-relaxed">{description}</p>
        </div>
    </div>
);


const CreativeWritingAboutPage: React.FC = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">لماذا "بداية الرحلة"؟</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        لأننا نؤمن أن بداخل كل طفل كاتباً عظيماً ينتظر من يكتشفه. برنامجنا ليس لتعليم قواعد الكتابة، بل لإطلاق العنان لصوت طفلك الفريد ومنحه الثقة ليروي قصصه الخاصة.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                     <div className="relative">
                        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse"></div>}
                        <img 
                            src="https://i.ibb.co/n7ZJv9V/child-learning-online.jpg"
                            alt="طفل يشارك في جلسة كتابة إبداعية عبر الإنترنت"
                            className={`rounded-2xl shadow-2xl transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                        />
                    </div>
                     <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-gray-800">رحلة شخصية، وليست درساً</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            نحن لا نقدم دروسًا، بل نقدم رحلة شخصية بصحبة مرشد متخصص. في جلسات فردية مباشرة، نأخذ بيد طفلك بعيدًا عن سطوة القواعد الصارمة والتقييم، ونمنحه حرية الورقة البيضاء. هنا، لا توجد إجابات صحيحة أو خاطئة؛ يوجد فقط صوت طفلك، خياله، وقصته التي تنتظر أن تُروى.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>بيئة آمنة وداعمة تركز على الإلهام بدلاً من النقد.</span></li>
                            <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>جلسات فردية مباشرة تضمن الاهتمام الكامل بطفلك.</span></li>
                            <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>منهجية مرنة تتكيف مع اهتمامات وشخصية كل طفل.</span></li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">فلسفتنا في ثلاث كلمات</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard 
                            icon={<Star size={24} />}
                            title="الإلهام أولاً"
                            description="نبدأ بإشعال شرارة الفضول والخيال، فالأفكار العظيمة تولد من الشغف وليس من القواعد."
                        />
                         <FeatureCard 
                            icon={<PenTool size={24} />}
                            title="الممارسة تصنع المبدع"
                            description="نؤمن بأن الكتابة مهارة تنمو بالتجربة، لذلك نوفر مساحة للتعبير الحر والمستمر."
                        />
                         <FeatureCard 
                            icon={<Shield size={24} />}
                            title="الثقة هي المفتاح"
                            description="هدفنا الأسمى هو بناء ثقة الطفل بصوته وقدراته، ليصبح معبراً عن ذاته بطلاقة."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CreativeWritingAboutPage;