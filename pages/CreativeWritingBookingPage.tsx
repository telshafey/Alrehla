import React, { useState, useEffect } from 'react';
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
import { Card, CardContent } from '../components/ui/card';

type BookingStep = 'child' | 'package' | 'instructor' | 'schedule';

const stepsConfig = [
    { key: 'child', title: 'اختر الطفل' },
    { key: 'package', title: 'اختر الباقة' },
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
    
    const [step, setStep] = useState<BookingStep>('child');
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [childData, setChildData] = useState({ childName: '', childAge: '', childGender: '' as 'ذكر' | 'أنثى' | '' });
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date, time: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Pre-fill from location state if coming from instructor profile
        if (location.state?.instructor) {
            setSelectedInstructor(location.state.instructor);
            setStep('schedule'); // Assuming they need to pick a time next
        }
        if (location.state?.selectedDateTime) {
            setSelectedDateTime(location.state.selectedDateTime);
        }
    }, [location.state]);

    if (!isLoggedIn && !authLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="mb-4">يجب تسجيل الدخول أولاً لحجز جلسة.</p>
                <Button asChild><Link to="/account" state={{ from: location }}>تسجيل الدخول</Link></Button>
            </div>
        );
    }
    
    const isLoading = authLoading || bookingDataLoading;
    if (isLoading) return <PageLoader text="جاري تجهيز صفحة الحجز..." />;

    const { instructors = [], cw_packages = [], holidays = [] } = bookingData || {};
    
    const handleNext = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex < stepsConfig.length - 1) {
            let nextStep = stepsConfig[currentIndex + 1].key as BookingStep;
            // Skip instructor selection if package is free session as it's auto-assigned
            if (step === 'package' && selectedPackage?.price === 0 && instructors.length > 0) {
                 setSelectedInstructor(instructors[0]); // Auto-assign first instructor for mock
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
                childAge: child.age.toString(),
                childGender: child.gender,
            });
        } else {
            setSelectedChildId(null);
        }
    };


    const isNextDisabled = () => {
        switch (step) {
            case 'child': return !childData.childName || !childData.childAge || !childData.childGender;
            case 'package': return !selectedPackage;
            case 'instructor': return !selectedInstructor;
            case 'schedule': return !selectedDateTime;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!childData.childName || !selectedPackage || !selectedInstructor || !selectedDateTime) {
            addToast('بيانات الحجز غير مكتملة.', 'error');
            return;
        }
        
        setIsSubmitting(true);
        
        const childForCart: ChildProfile = selectedChildId
            ? childProfiles.find(c => c.id === selectedChildId)!
            : {
                id: -1,
                name: childData.childName,
                age: parseInt(childData.childAge, 10),
                gender: childData.childGender as 'ذكر' | 'أنثى',
                user_id: currentUser!.id,
                created_at: new Date().toISOString(),
                avatar_url: null,
                interests: null,
                strengths: null,
                student_user_id: null,
            };

        addItemToCart({
            type: 'booking',
            payload: {
                child: childForCart,
                package: selectedPackage,
                instructor: selectedInstructor,
                dateTime: selectedDateTime,
                total: selectedPackage.price,
                summary: `${selectedPackage.name} لـ ${childData.childName}`
            }
        });
        
        addToast('تمت إضافة الحجز إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

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
                        />;
            case 'package':
                return <PackageSelection packages={cw_packages} onSelect={setSelectedPackage} />;
            case 'instructor':
                return <InstructorSelection instructors={instructors} onSelect={setSelectedInstructor} />;
            case 'schedule':
                if (!selectedInstructor) return <p>الرجاء اختيار مدرب أولاً.</p>;
                return <CalendarSelection instructor={selectedInstructor} holidays={holidays} onSelect={(date, time) => setSelectedDateTime({ date, time })} />;
        }
    };

    return (
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
                           <CardContent className="pt-8 space-y-10">
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
                           />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeWritingBookingPage;