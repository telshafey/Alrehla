
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingData } from '../hooks/queries/public/usePageDataQuery';
import PageLoader from '../components/ui/PageLoader';
import OrderStepper from '../components/order/OrderStepper';
import ChildDetailsSection from '../components/order/ChildDetailsSection';
import PackageSelection from '../components/creative-writing/booking/PackageSelection';
import InstructorSelection from '../components/creative-writing/booking/InstructorSelection';
import CalendarSelection from '../components/creative-writing/booking/CalendarSelection';
import BookingSummary from '../components/creative-writing/booking/BookingSummary';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import type { ChildProfile, CreativeWritingPackage, Instructor } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ChildProfileModal from '../components/account/ChildProfileModal';

type BookingStep = 'package' | 'child' | 'instructor' | 'schedule';

const stepsConfig = [
    { key: 'package', title: 'اختر الباقة' },
    { key: 'child', title: 'اختر الطفل' },
    { key: 'instructor', title: 'اختر المدرب' },
    { key: 'schedule', title: 'اختر الموعد' },
];

const CreativeWritingBookingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, currentUser, childProfiles, loading: authLoading } = useAuth();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    const { data: bookingData, isLoading: bookingDataLoading } = useBookingData();
    
    const [step, setStep] = useState<BookingStep>('package');
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [childData, setChildData] = useState({ childName: '', childBirthDate: '', childGender: '' as 'ذكر' | 'أنثى' | '' });
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date, time: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.selectedPackage) {
            setSelectedPackage(location.state.selectedPackage);
            setStep('child');
        }
        if (location.state?.instructor) {
            setSelectedInstructor(location.state.instructor);
            setStep('schedule');
        }
    }, [location.state]);
    
    const { instructors = [], cw_packages = [], holidays = [], activeBookings = [], pricingConfig } = (bookingData as any) || {};
    
    // المعادلة الديناميكية لحساب سعر العميل النهائي
    const finalPrice = useMemo(() => {
        if (!selectedPackage) return null;
        if (selectedPackage.price === 0) return 0;
        
        if (selectedInstructor && selectedPackage) {
            const netPrice = selectedInstructor.package_rates?.[selectedPackage.id];
            
            // إذا لم يحدد المدرب سعراً خاصاً، نستخدم السعر الأساسي للباقة (أو منطق آخر تفضله)
            const baseNet = netPrice !== undefined ? netPrice : selectedPackage.price;
            
            const percentage = pricingConfig?.company_percentage || 1.2;
            const fixedFee = pricingConfig?.fixed_fee || 50;

            return Math.ceil((baseNet * percentage) + fixedFee);
        }
        return null;
    }, [selectedPackage, selectedInstructor, pricingConfig]);

    // حساب نطاق الأسعار للباقة المختارة قبل اختيار المدرب
    const priceRange = useMemo(() => {
        if (!selectedPackage || finalPrice !== null) return null;
        if (selectedPackage.price === 0) return { min: 0, max: 0 };

        const percentage = pricingConfig?.company_percentage || 1.2;
        const fixedFee = pricingConfig?.fixed_fee || 50;

        const prices = (instructors as Instructor[])
            .map((i: Instructor) => {
                const net = i.package_rates?.[selectedPackage.id];
                return net !== undefined ? Math.ceil((net * percentage) + fixedFee) : null;
            })
            .filter((p): p is number => p !== null);

        if (prices.length === 0) return { min: selectedPackage.price, max: selectedPackage.price };
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [selectedPackage, finalPrice, instructors, pricingConfig]);


    const isLoading = authLoading || bookingDataLoading;
    if (isLoading) return <PageLoader text="جاري تجهيز صفحة الحجز..." />;
    
    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="mb-4 text-lg">يجب تسجيل الدخول أولاً لحجز رحلتك التدريبية.</p>
                <Button as={Link} to="/account" state={{ from: location }} size="lg">تسجيل الدخول / إنشاء حساب</Button>
            </div>
        );
    }

    const handleNext = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex < stepsConfig.length - 1) {
            setStep(stepsConfig[currentIndex + 1].key as BookingStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const handleBack = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex > 0) {
            setStep(stepsConfig[currentIndex - 1].key as BookingStep);
        } else {
            navigate('/creative-writing');
        }
    };

    const handleSelectChild = (child: ChildProfile | null) => {
        if (child) {
            setSelectedChildId(child.id);
            setChildData({ childName: child.name, childBirthDate: child.birth_date, childGender: child.gender });
        } else {
            setSelectedChildId(null);
            setChildData({ childName: '', childBirthDate: '', childGender: '' });
        }
    };
    
    const handleSelectSelf = () => {
        if(!currentUser) return;
        setSelectedChildId(null);
        setChildData({ childName: currentUser.name, childBirthDate: '', childGender: '' });
    };

    const isNextDisabled = () => {
        switch (step) {
            case 'package': return !selectedPackage;
            case 'child': return !childData.childName || !childData.childBirthDate || !childData.childGender;
            case 'instructor': return !selectedInstructor;
            case 'schedule': return !selectedDateTime;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!childData.childName || !selectedPackage || !selectedInstructor || !selectedDateTime || finalPrice === null) {
            addToast('بيانات الحجز غير مكتملة.', 'error');
            return;
        }
        
        setIsSubmitting(true);
        const childForCart: Partial<ChildProfile> = selectedChildId
            ? childProfiles.find(c => c.id === selectedChildId)!
            : {
                id: -1,
                name: childData.childName,
                birth_date: childData.childBirthDate,
                gender: childData.childGender as 'ذكر' | 'أنثى',
            };

        addItemToCart({
            type: 'booking',
            payload: {
                child: childForCart,
                package: selectedPackage,
                instructor: selectedInstructor,
                dateTime: selectedDateTime,
                total: finalPrice,
                summary: `${selectedPackage.name} لـ ${childData.childName} (مع ${selectedInstructor.name})`
            }
        });
        
        addToast('تمت إضافة الحجز إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

    const currentStepTitle = stepsConfig.find(s => s.key === step)?.title;

    return (
        <>
            <ChildProfileModal isOpen={isChildModalOpen} onClose={() => setIsChildModalOpen(false)} childToEdit={null} />
            <div className="bg-muted/50 py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12 text-center">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">حجز رحلة إبداعية</h1>
                            <p className="mt-2 text-muted-foreground">اختر باقتك ومدربك المفضل لبدء الرحلة.</p>
                        </div>
                        <div className="mb-12">
                            <OrderStepper steps={stepsConfig} currentStep={step} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-primary">
                               {currentStepTitle && (
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{currentStepTitle}</CardTitle>
                                    </CardHeader>
                                )}
                               <CardContent className="pt-2 space-y-10">
                                  {step === 'package' && <PackageSelection packages={cw_packages as CreativeWritingPackage[]} onSelect={setSelectedPackage} />}
                                  {step === 'child' && <ChildDetailsSection childProfiles={childProfiles} onSelectChild={handleSelectChild} selectedChildId={selectedChildId} formData={childData} handleChange={(e) => setChildData(p => ({...p, [e.target.name]: e.target.value}))} errors={{}} currentUser={currentUser} onSelectSelf={handleSelectSelf} onAddChild={() => setIsChildModalOpen(true)} />}
                                  {step === 'instructor' && <InstructorSelection instructors={instructors as Instructor[]} onSelect={setSelectedInstructor} />}
                                  {step === 'schedule' && selectedInstructor && <CalendarSelection instructor={selectedInstructor} holidays={holidays as string[]} activeBookings={activeBookings as any[]} onSelect={(date, time) => setSelectedDateTime({ date, time })} />}
                                  
                                  <div className="flex justify-between items-center pt-6 border-t">
                                      <Button onClick={handleBack} variant="outline" icon={<ArrowLeft className="transform rotate-180" />}>السابق</Button>
                                      {step !== 'schedule' ? (
                                          <Button onClick={handleNext} disabled={isNextDisabled()}>التالي <ArrowLeft /></Button>
                                      ) : (
                                           <p className="text-sm text-blue-600 font-bold animate-pulse">يرجى مراجعة الملخص النهائي للتأكيد</p>
                                      )}
                                  </div>
                               </CardContent>
                            </Card>
                            <div className="lg:col-span-1 sticky top-24">
                               <BookingSummary 
                                    childName={childData.childName} 
                                    pkg={selectedPackage} 
                                    instructor={selectedInstructor} 
                                    dateTime={selectedDateTime} 
                                    onSubmit={handleSubmit} 
                                    isSubmitting={isSubmitting} 
                                    isConfirmStep={step === 'schedule'} 
                                    finalPrice={finalPrice} 
                                    priceRange={priceRange} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreativeWritingBookingPage;
