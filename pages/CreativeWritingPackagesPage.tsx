import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import { Button } from '../components/ui/Button';
import { CheckCircle, X, ArrowLeft, Star, Clock, User, Video } from 'lucide-react';
import type { CreativeWritingPackage, Instructor } from '../lib/database.types';

const FeatureRow: React.FC<{ label: string; values: (string | boolean)[] }> = ({ label, values }) => (
    <tr className="border-b last:border-b-0">
        <th scope="row" className="py-4 px-2 sm:px-4 text-right font-semibold text-gray-700 bg-gray-50">{label}</th>
        {values.map((value, index) => (
            <td key={index} className="py-4 px-2 sm:px-4 text-center">
                {typeof value === 'boolean' ? (
                    value ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <X className="w-6 h-6 text-gray-400 mx-auto" />
                ) : (
                    <span className="text-gray-600 text-sm sm:text-base">{value}</span>
                )}
            </td>
        ))}
    </tr>
);

const CreativeWritingPackagesPage: React.FC = () => {
    const { data, isLoading } = usePublicData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل الباقات..." />;
    }

    const packages = (data?.creativeWritingPackages || []) as CreativeWritingPackage[];
    const instructors = (data?.instructors || []) as Instructor[];
    
    const getPackagePriceRange = (pkg: CreativeWritingPackage) => {
        if (pkg.price === 0) return { min: 0, max: 0 };

        const prices = instructors
            .map(i => i.package_rates?.[pkg.id])
            .filter((price): price is number => price !== undefined && price !== null);

        if (prices.length === 0) {
            return { min: pkg.price, max: pkg.price }; // Fallback to base price
        }
        return { min: Math.min(...prices), max: Math.max(...prices) };
    };
    
    // Define features to compare
    const features = [
        { label: 'عدد الجلسات', key: 'sessions' },
        { label: 'الهدف الأساسي', key: 'description', transform: (pkg: CreativeWritingPackage) => {
            if (pkg.name === 'الجلسة التعريفية') return 'تقييم وتخطيط';
            if (pkg.name === 'باقة الانطلاق') return 'تعلم الأساسيات';
            if (pkg.name === 'الباقة الأساسية') return 'بناء متكامل للمهارات';
            if (pkg.name === 'باقة التخصص') return 'صقل الأسلوب والتخصص';
             if (pkg.name === 'باقة التميز') return 'المسار الاحترافي الكامل';
            return 'N/A';
        }},
        { label: 'محفظة رقمية للأعمال', key: 'features', check: 'محفظة رقمية للأعمال' },
        { label: 'شهادة إتمام', key: 'features', check: 'شهادة إتمام' },
        { label: 'نشر عمل في المجلة', key: 'features', check: 'نشر عمل في المجلة الإلكترونية' },
        { label: 'جلسات إرشاد إضافية', key: 'features', check: 'جلسات إرشاد إضافية' },
    ];


    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">باقات بداية الرحلة</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        لكل مبدع صغير رحلته الخاصة. اخترنا لكم باقات متنوعة تناسب كل مرحلة من مراحل تطور الكاتب الواعد، من اكتشاف الشغف إلى صقل الموهبة.
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-right">
                        <thead>
                            <tr className="border-b-2">
                                <th className="py-4 px-2 sm:px-4 text-right font-bold text-lg w-1/4">الميزة</th>
                                {packages.map(pkg => (
                                    <th key={pkg.id} className="py-4 px-2 sm:px-4 text-center font-bold text-lg w-1/5">
                                        <div className="flex flex-col items-center">
                                            <span>{pkg.name}</span>
                                            {pkg.popular && <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full mt-1">الأكثر شيوعاً</span>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {features.map(feature => (
                                <FeatureRow 
                                    key={feature.label}
                                    label={feature.label}
                                    values={packages.map(pkg => {
                                        if (feature.check) {
                                            return pkg.features.some(f => f.includes(feature.check!));
                                        }
                                        if (feature.transform) {
                                            return feature.transform(pkg);
                                        }
                                        return (pkg as any)[feature.key] as string;
                                    })}
                                />
                            ))}
                            <tr className="border-b">
                                <th scope="row" className="py-4 px-2 sm:px-4 text-right font-semibold text-gray-700 bg-gray-50">السعر</th>
                                {packages.map(pkg => {
                                    const priceRange = getPackagePriceRange(pkg);
                                    return (
                                        <td key={pkg.id} className="py-4 px-2 sm:px-4 text-center font-extrabold text-gray-800">
                                            { priceRange.min === 0 && priceRange.max === 0
                                                ? <span className="text-2xl">مجانية</span>
                                                : priceRange.min === priceRange.max
                                                ? <span className="text-2xl">{priceRange.min} ج.م</span>
                                                : <div className="text-xl">
                                                    <span>{priceRange.min} - {priceRange.max}</span>
                                                    <span className="text-base font-medium text-gray-600 ml-1">ج.م</span>
                                                  </div>
                                            }
                                        </td>
                                    )
                                })}
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td></td>
                                {packages.map(pkg => (
                                    <td key={pkg.id} className="py-6 px-2 sm:px-4 text-center">
                                        <Button asChild>
                                            <Link to="/creative-writing/booking">
                                                {pkg.price === 0 ? 'ابدأ الآن' : 'اطلب الباقة'}
                                            </Link>
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>

                 <section className="mt-20 bg-gray-50 p-8 rounded-2xl border">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ماذا تعني "الجلسة"؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
                        <div className="flex flex-col items-center">
                            <Clock className="w-10 h-10 text-blue-500 mb-2" />
                            <h3 className="font-bold">45 دقيقة</h3>
                            <p className="text-sm text-gray-600">من التركيز الكامل والإبداع الموجه.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <User className="w-10 h-10 text-blue-500 mb-2" />
                            <h3 className="font-bold">فردية (1-to-1)</h3>
                            <p className="text-sm text-gray-600">اهتمام كامل بطفلك لضمان أقصى استفادة.</p>
                        </div>
                         <div className="flex flex-col items-center">
                            <Video className="w-10 h-10 text-blue-500 mb-2" />
                            <h3 className="font-bold">عبر الإنترنت</h3>
                            <p className="text-sm text-gray-600">من أي مكان وفي بيئة آمنة ومريحة.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CreativeWritingPackagesPage;