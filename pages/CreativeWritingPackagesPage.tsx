
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import { Button } from '../components/ui/Button';
import { CheckCircle, X, ArrowLeft, Star, Clock, User, Video, LayoutGrid, Table as TableIcon, ArrowRight } from 'lucide-react';
import type { CreativeWritingPackage, Instructor, ComparisonItem } from '../lib/database.types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { IconMap } from '../components/creative-writing/services/IconMap';

// --- Comparison Table Components ---
const FeatureRow: React.FC<{ label: string; values: (string | boolean | undefined)[] }> = ({ label, values }) => (
    <tr className="border-b last:border-b-0">
        <th scope="row" className="py-4 px-2 sm:px-4 text-right font-semibold text-gray-700 bg-gray-50/50">{label}</th>
        {values.map((value, index) => (
            <td key={index} className="py-4 px-2 sm:px-4 text-center">
                {typeof value === 'boolean' ? (
                    value ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <X className="w-6 h-6 text-gray-400 mx-auto" />
                ) : (
                    <span className="text-gray-600 text-sm sm:text-base">{value || '-'}</span>
                )}
            </td>
        ))}
    </tr>
);

// --- Detailed Card Component ---
const PackageDetailCard: React.FC<{ pkg: CreativeWritingPackage; priceRange: { min: number, max: number } }> = ({ pkg, priceRange }) => {
    const isFree = pkg.price === 0;
    
    return (
        <Card className={`h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 ${pkg.popular ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'}`}>
            <CardHeader className={`${pkg.popular ? 'bg-primary/5' : 'bg-gray-50/50'} pb-6`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100">
                         {IconMap[pkg.icon_name || 'Rocket'] || IconMap['Rocket']}
                    </div>
                    {pkg.popular && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Star size={12} fill="currentColor" /> الأكثر شيوعاً
                        </span>
                    )}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed min-h-[3rem]">{pkg.description}</p>
            </CardHeader>
            
            <CardContent className="flex-grow pt-6 space-y-6">
                 {/* Price Section */}
                <div className="flex items-baseline gap-1">
                    {isFree ? (
                         <span className="text-3xl font-extrabold text-green-600">مجانية</span>
                    ) : (
                        <>
                             <span className="text-3xl font-extrabold text-foreground">{priceRange.min}</span>
                             {priceRange.min !== priceRange.max && <span className="text-xl text-muted-foreground">- {priceRange.max}</span>}
                             <span className="text-sm font-medium text-muted-foreground">ج.م</span>
                        </>
                    )}
                </div>
                
                 {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="block text-xs text-muted-foreground mb-1">عدد الجلسات</span>
                        <span className="font-semibold text-foreground">{pkg.sessions}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                         <span className="block text-xs text-muted-foreground mb-1">المستوى</span>
                         <span className="font-semibold text-foreground">{pkg.level || 'غير محدد'}</span>
                    </div>
                     <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 col-span-2">
                         <span className="block text-xs text-muted-foreground mb-1">الفئة العمرية</span>
                         <span className="font-semibold text-foreground">{pkg.target_age || 'غير محدد'}</span>
                    </div>
                </div>
                
                {/* Description */}
                {pkg.detailed_description && (
                     <div className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        {pkg.detailed_description}
                    </div>
                )}

                {/* Features List */}
                <ul className="space-y-3">
                    {pkg.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                        </li>
                    ))}
                    {pkg.features.length > 4 && (
                        <li className="text-xs text-muted-foreground pt-1 pr-8">+ {pkg.features.length - 4} ميزات أخرى...</li>
                    )}
                </ul>
            </CardContent>

            <CardFooter className="pt-4 pb-6">
                <Button as={Link} to="/creative-writing/booking" state={{ selectedPackage: pkg }} className="w-full" size="lg" variant={isFree ? 'success' : (pkg.popular ? 'default' : 'outline')}>
                    {isFree ? 'احجز الآن مجاناً' : 'اختيار الباقة'}
                    <ArrowLeft size={18} className="mr-2 rtl:rotate-180" />
                </Button>
            </CardFooter>
        </Card>
    );
}


const CreativeWritingPackagesPage: React.FC = () => {
    const { data, isLoading } = usePublicData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل الباقات..." />;
    }

    const packages = (data?.creativeWritingPackages || []) as CreativeWritingPackage[];
    const instructors = (data?.instructors || []) as Instructor[];
    const comparisonItems = (data?.comparisonItems || []) as ComparisonItem[];
    
    const getPackagePriceRange = (pkg: CreativeWritingPackage) => {
        if (pkg.price === 0) return { min: 0, max: 0 };

        const prices = instructors
            .map(i => i.package_rates?.[pkg.id])
            .filter((price): price is number => price !== undefined && price !== null);

        if (prices.length === 0) {
            return { min: pkg.price, max: pkg.price };
        }
        return { min: Math.min(...prices), max: Math.max(...prices) };
    };
    
    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">باقات بداية الرحلة</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        لكل مبدع صغير رحلته الخاصة. اخترنا لكم باقات متنوعة تناسب كل مرحلة من مراحل تطور الكاتب الواعد، من اكتشاف الشغف إلى صقل الموهبة.
                    </p>
                </div>

                <Tabs defaultValue="cards" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-gray-100/80 backdrop-blur rounded-full">
                            <TabsTrigger value="cards" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <LayoutGrid className="w-4 h-4 mr-2" /> عرض تفصيلي
                            </TabsTrigger>
                            <TabsTrigger value="compare" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <TableIcon className="w-4 h-4 mr-2" /> مقارنة الباقات
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="cards" className="animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map(pkg => (
                                <PackageDetailCard 
                                    key={pkg.id} 
                                    pkg={pkg} 
                                    priceRange={getPackagePriceRange(pkg)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="compare" className="animate-fadeIn">
                        <div className="overflow-x-auto border rounded-2xl shadow-sm">
                            <table className="w-full min-w-[800px] border-collapse text-right bg-white">
                                <thead>
                                    <tr className="border-b-2 border-gray-100">
                                        <th className="py-6 px-4 text-right font-bold text-lg w-1/4 bg-gray-50/50">الميزة</th>
                                        {packages.map(pkg => (
                                            <th key={pkg.id} className={`py-6 px-4 text-center font-bold text-lg w-1/5 ${pkg.popular ? 'bg-primary/5 border-t-4 border-t-primary' : ''}`}>
                                                <div className="flex flex-col items-center gap-2">
                                                    <span>{pkg.name}</span>
                                                    {pkg.popular && <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">الأكثر شيوعاً</span>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Static Row: Number of Sessions (Always First) */}
                                    <FeatureRow 
                                        label="عدد الجلسات"
                                        values={packages.map(pkg => pkg.sessions)}
                                    />
                                    
                                    {/* Dynamic Rows from comparisonItems */}
                                    {comparisonItems.map(item => (
                                        <FeatureRow 
                                            key={item.id}
                                            label={item.label}
                                            values={packages.map(pkg => {
                                                return pkg.comparison_values?.[item.id];
                                            })}
                                        />
                                    ))}
                                    
                                    <tr className="border-b">
                                        <th scope="row" className="py-6 px-4 text-right font-semibold text-gray-700 bg-gray-50/50">السعر</th>
                                        {packages.map(pkg => {
                                            const priceRange = getPackagePriceRange(pkg);
                                            return (
                                                <td key={pkg.id} className={`py-6 px-4 text-center font-extrabold text-gray-800 ${pkg.popular ? 'bg-primary/5' : ''}`}>
                                                    { priceRange.min === 0 && priceRange.max === 0
                                                        ? <span className="text-2xl text-green-600">مجانية</span>
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
                                        <td className="bg-gray-50/50"></td>
                                        {packages.map(pkg => (
                                            <td key={pkg.id} className={`py-8 px-4 text-center ${pkg.popular ? 'bg-primary/5' : ''}`}>
                                                <Button as={Link} to="/creative-writing/booking" state={{ selectedPackage: pkg }} variant={pkg.price === 0 ? 'success' : 'default'} size="sm">
                                                    {pkg.price === 0 ? 'ابدأ الآن' : 'اطلب الباقة'}
                                                </Button>
                                            </td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>

                 <section className="mt-24 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 sm:p-12 rounded-3xl border border-blue-100 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">ماذا تعني "الجلسة" في بداية الرحلة؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">45 دقيقة</h3>
                            <p className="text-sm text-gray-600">من التركيز الكامل والإبداع الموجه في كل لقاء.</p>
                        </div>
                        <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm">
                             <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                                <User size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">فردية (1-to-1)</h3>
                            <p className="text-sm text-gray-600">اهتمام كامل بطفلك لضمان أقصى استفادة وتوجيه شخصي.</p>
                        </div>
                         <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm">
                             <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                                <Video size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">عبر الإنترنت</h3>
                            <p className="text-sm text-gray-600">من أي مكان وفي بيئة آمنة ومريحة (عبر Jitsi Meet).</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CreativeWritingPackagesPage;
