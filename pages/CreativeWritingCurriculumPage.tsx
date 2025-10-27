import React from 'react';
import { Book, Award, FileText, GraduationCap, Sparkles, Wand2, Star } from 'lucide-react';

const TimelineStep: React.FC<{ stage: string; title: string; sessions: string; description: string; isLast?: boolean }> = ({ stage, title, sessions, description, isLast = false }) => (
    <div className="relative pl-8 sm:pl-12 py-6">
        {!isLast && <div className="absolute top-5 left-5 -ml-px mt-0.5 h-full w-0.5 bg-gray-200"></div>}
        <div className="relative flex items-center space-x-4 rtl:space-x-reverse">
            <div className="z-10 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {stage}
            </div>
            <div className="flex-grow p-6 bg-white rounded-2xl shadow-lg border">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{sessions}</span>
                </div>
                <p className="mt-3 text-gray-600">{description}</p>
            </div>
        </div>
    </div>
);


const CreativeWritingCurriculumPage: React.FC = () => {
    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">خريطة الرحلة الإبداعية</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        مسار تعليمي مصمم بعناية لينقل طفلك من مجرد فكرة إلى قصة متكاملة، خطوة بخطوة.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <TimelineStep 
                        stage="1"
                        title="اكتشاف الصوت"
                        sessions="الجلسات 1-3"
                        description="في هذه المرحلة، نركز على كسر حاجز الخوف من الكتابة. يتعلم الطفل كيف يصطاد الأفكار من عالمه اليومي، ويبدأ في التعبير عن نفسه بثقة من خلال تدريبات ممتعة على الوصف والسرد البسيط."
                    />
                     <TimelineStep 
                        stage="2"
                        title="صياغة الحكاية"
                        sessions="الجلسات 4-8"
                        description="هنا تبدأ المغامرة الحقيقية. نغوص أعمق في فن بناء الشخصيات، وخلق العوالم، ونسج الأحداث. يتعلم الطفل أدوات السرد الأساسية ويجرب تقنيات إبداعية متنوعة لتطوير قصصه."
                    />
                     <TimelineStep 
                        stage="3"
                        title="إتقان السرد"
                        sessions="الجلسات 9-12"
                        description="المرحلة الأخيرة حيث يتحول الكاتب الصغير إلى صانع قصص متمرس. نركز على تحرير النصوص، مراجعتها، وإضافة اللمسات النهائية التي تجعل القصة تتألق، استعداداً لمشاركتها مع العالم."
                        isLast
                    />
                </div>

                 <div className="mt-24">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                         <h2 className="text-4xl font-extrabold text-gray-800">كنوز رحلتك</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            في نهاية البرنامج، لا يخرج طفلك بيدين فارغتين، بل يحمل معه ما يثبت إنجازه ونموه.
                        </p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-blue-50 p-8 rounded-2xl border-l-4 border-blue-500 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FileText /> المحفظة الرقمية</h3>
                            <ul className="space-y-3 list-none text-gray-600">
                                <li className="flex items-start"><Sparkles className="text-yellow-500 mt-1 me-3 flex-shrink-0"/><span><span className="font-semibold">3-5 أعمال إبداعية مكتملة</span> (قصص، خواطر، بداية رواية).</span></li>
                                <li className="flex items-start"><Sparkles className="text-yellow-500 mt-1 me-3 flex-shrink-0"/><span>تسجيلات صوتية للطفل وهو يقرأ أفضل أعماله بفخر.</span></li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-8 rounded-2xl border-l-4 border-green-500 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><GraduationCap /> شهادة وتقرير الإنجاز</h3>
                            <ul className="space-y-3 list-none text-gray-600">
                                <li className="flex items-start"><Star className="text-yellow-500 mt-1 me-3 flex-shrink-0"/><span><span className="font-semibold">شهادة معتمدة</span> تثبت إتمام البرنامج بنجاح.</span></li>
                                <li className="flex items-start"><Star className="text-yellow-500 mt-1 me-3 flex-shrink-0"/><span><span className="font-semibold">تقرير مفصل</span> من المدرب يوضح نقاط القوة ومسارات التطوير المستقبلية.</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreativeWritingCurriculumPage;