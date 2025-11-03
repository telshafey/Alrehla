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

type BookingStep = 'child' | 'package' | 'instructor' | 'schedule';

const stepsConfig = [
    { key: 'child', title: 'اختر الطفل' },
    { key: 'package', title: 'اختر الباقة' },
    { key: 'instructor', title: 'اختر المدرب' },
    { key: 'schedule', title: 'اختر الموعد' },
];

const CreativeWritingBookingPage: React.FC = () => {
    // --- ALL HOOKS AT THE TOP ---
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, currentUser, childProfiles, loading: authLoading } = useAuth();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    const { data: bookingData, isLoading: bookingDataLoading } = useBookingData();
    
    const [step, setStep] = useState<BookingStep>('child');
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [childData, setChildData] = useState({ childName: '', childBirthDate: '', childGender: '' as 'ذكر' | 'أنثى' | '' });
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date, time: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.instructor) {
            setSelectedInstructor(location.state.instructor);
            setStep('schedule');
        }
        if (location.state?.selectedDateTime) {
            setSelectedDateTime(location.state.selectedDateTime);
        }
    }, [location.state]);
    
    const { instructors = [], cw_packages = [], holidays = [] } = bookingData || {};
    
    const finalPrice = useMemo(() => {
        if (!selectedPackage) return null;
        if (selectedPackage.price === 0) return 0;
        if (selectedInstructor && selectedPackage) {
            return selectedInstructor.package_rates?.[selectedPackage.id] ?? selectedPackage.price;
        }
        return null;
    }, [selectedPackage, selectedInstructor]);

    const priceRange = useMemo(() => {
        if (!selectedPackage || finalPrice !== null) return null;
        const prices = (instructors as Instructor[])
            .map((i: Instructor) => i.package_rates?.[selectedPackage.id])
            .filter((price): price is number => price !== undefined && price !== null);

        if (prices.length === 0) return { min: selectedPackage.price, max: selectedPackage.price };
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [selectedPackage, finalPrice, instructors]);


    // --- CONDITIONAL RETURNS CAN GO HERE ---
    
    const isLoading = authLoading || bookingDataLoading;
    if (isLoading) {
        return <PageLoader text="جاري تجهيز صفحة الحجز..." />;
    }
    
    // This check is technically redundant because of ProtectedRoute, but acts as a safe fallback.
    // It's safe to have it here because all hooks have been called unconditionally above.
    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="mb-4">يجب تسجيل الدخول أولاً لحجز جلسة.</p>
                <Button as={Link} to="/account" state={{ from: location }}>تسجيل الدخول</Button>
            </div>
        );
    }
    
    // --- REST OF COMPONENT LOGIC ---

    const handleNext = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex < stepsConfig.length - 1) {
            let nextStep = stepsConfig[currentIndex + 1].key as BookingStep;
            if (step === 'package' && selectedPackage?.price === 0 && instructors.length > 0) {
                 setSelectedInstructor(instructors[0] as Instructor);
                 nextStep = 'schedule';
            }
            setStep(nextStep);
        }
    };
    
    const handleBack = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex > 0) {
            let prevStep = stepsConfig[currentIndex - 1].key as BookingStep;
             if (prevStep === 'instructor' && selectedPackage?.price === 0) {
                 prevStep = 'package';
             }
            setStep(prevStep);
        } else {
            navigate('/creative-writing');
        }
    };

    const handleChildDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setChildData(prev => ({ ...prev, [name]: value }));
        if (selectedChildId !== null) {
            setSelectedChildId(null);
        }
    };

    const handleSelectChild = (child: ChildProfile | null) => {
        if (child) {
            setSelectedChildId(child.id);
            setChildData({
                childName: child.name,
                childBirthDate: child.birth_date,
                childGender: child.gender,
            });
        } else {
            setSelectedChildId(null);
            setChildData({ childName: '', childBirthDate: '', childGender: '' });
        }
    };
    
    const handleSelectSelf = () => {
        if(!currentUser) return;
        setSelectedChildId(null);
        setChildData({
            childName: currentUser.name,
            childBirthDate: '',
            childGender: '',
        });
    };


    const isNextDisabled = () => {
        switch (step) {
            case 'child': return !childData.childName || !childData.childBirthDate || !childData.childGender;
            case 'package': return !selectedPackage;
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
                summary: `${selectedPackage.name} لـ ${childData.childName}`
            }
        });
        
        addToast('تمت إضافة الحجز إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

    const currentStepTitle = stepsConfig.find(s => s.key === step)?.title;

    const renderStepContent = () => {
        switch (step) {
            case 'child':
                return <ChildDetailsSection 
                            childProfiles={childProfiles}
                            onSelectChild={handleSelectChild}
                            selectedChildId={selectedChildId}
                            formData={childData}
                            handleChange={handleChildDataChange}
                            errors={{}}
                            currentUser={currentUser}
                            onSelectSelf={handleSelectSelf}
                            onAddChild={() => setIsChildModalOpen(true)}
                        />;
            case 'package':
                return <PackageSelection packages={cw_packages as CreativeWritingPackage[]} onSelect={setSelectedPackage} />;
            case 'instructor':
                return <InstructorSelection instructors={instructors as Instructor[]} onSelect={setSelectedInstructor} />;
            case 'schedule':
                if (!selectedInstructor) return <p>الرجاء اختيار مدرب أولاً.</p>;
                return <CalendarSelection instructor={selectedInstructor} holidays={holidays as string[]} onSelect={(date, time) => setSelectedDateTime({ date, time })} />;
        }
    };

    return (
        <>
            <ChildProfileModal isOpen={isChildModalOpen} onClose={() => setIsChildModalOpen(false)} childToEdit={null} />
            <div className="bg-muted/50 py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-12 text-center">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">حجز جلسة "بداية الرحلة"</h1>
                            <p className="mt-2 text-muted-foreground">اتبع الخطوات التالية لحجز باقتك التدريبية.</p>
                        </div>
                        <div className="mb-12">
                            <OrderStepper steps={stepsConfig} currentStep={step} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <Card className="lg:col-span-2">
                               {currentStepTitle && (
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{currentStepTitle}</CardTitle>
                                    </CardHeader>
                                )}
                               <CardContent className="pt-2 space-y-10">
                                  {renderStepContent()}
                                  <div className="flex justify-between items-center pt-6 border-t">
                                      <Button onClick={handleBack} variant="outline" icon={<ArrowLeft className="transform rotate-180" />}>
                                          السابق
                                      </Button>
                                      {step !== 'schedule' ? (
                                          <Button onClick={handleNext} disabled={isNextDisabled()}>
                                              التالي <ArrowLeft />
                                          </Button>
                                      ) : (
                                           <p className="text-sm text-muted-foreground">أكمل الحجز من الملخص على اليسار.</p>
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