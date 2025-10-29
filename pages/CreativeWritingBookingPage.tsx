import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import type { CreativeWritingPackage, Instructor, ChildProfile } from '../lib/database.types';
import BookingStep from '../components/creative-writing/booking/BookingStep';
import PackageSelection from '../components/creative-writing/booking/PackageSelection';
import InstructorSelection from '../components/creative-writing/booking/InstructorSelection';
import ChildSelection from '../components/creative-writing/booking/ChildSelection';
import CalendarSelection from '../components/creative-writing/booking/CalendarSelection';
import BookingSummary from '../components/creative-writing/booking/BookingSummary';
import { useBookingData } from '../hooks/queries/public/usePageDataQuery';

type BookingStepType = 'package' | 'instructor' | 'child' | 'calendar' | 'confirm';

const CreativeWritingBookingPage: React.FC = () => {
    const { data, isLoading: dataLoading } = useBookingData();
    const { currentUser, childProfiles, loading: authLoading } = useAuth();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState<BookingStepType>('package');
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (location.state?.instructor && location.state?.selectedDateTime) {
            setSelectedInstructor(location.state.instructor);
            setSelectedDateTime(location.state.selectedDateTime);
            setStep('package');
        }
    }, [location.state]);


    const isLoading = dataLoading || authLoading;

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>;
    }
    
    const { instructors = [], cw_packages = [], holidays = [] } = data || {};
    
    const handleNextStep = () => {
        switch (step) {
            case 'package':
                if (selectedInstructor) setStep('child');
                else setStep('instructor');
                break;
            case 'instructor':
                setStep('child');
                break;
            case 'child':
                 if (selectedDateTime) setStep('confirm');
                else setStep('calendar');
                break;
            case 'calendar':
                setStep('confirm');
                break;
        }
    };
    
    const handleBackStep = () => {
         switch (step) {
            case 'instructor':
                setStep('package');
                break;
            case 'child':
                 if (location.state?.instructor) setStep('package');
                 else setStep('instructor');
                break;
            case 'calendar':
                setStep('child');
                break;
            case 'confirm':
                if (location.state?.selectedDateTime) setStep('child');
                else setStep('calendar');
                break;
        }
    }

    const handleConfirmBooking = () => {
        if (!selectedPackage || !selectedInstructor || !selectedChild || !selectedDateTime) {
            addToast('بيانات الحجز غير مكتملة.', 'error');
            return;
        }

        setIsSubmitting(true);
        addItemToCart({
            type: 'booking',
            payload: {
                package: selectedPackage,
                instructor: selectedInstructor,
                child: selectedChild,
                dateTime: selectedDateTime,
                total: selectedPackage.price,
                summary: `${selectedPackage.name} مع ${selectedInstructor.name}`,
            }
        });
        addToast('تمت إضافة الحجز إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

    const steps = [
        { key: 'package', title: 'اختر الباقة', stepNumber: 1 },
        { key: 'instructor', title: 'اختر المدرب', stepNumber: 2 },
        { key: 'child', title: 'اختر الطفل', stepNumber: 3 },
        { key: 'calendar', title: 'اختر الموعد', stepNumber: 4 },
        { key: 'confirm', title: 'التأكيد', stepNumber: 5 },
    ];
    
    const currentStepIndex = steps.findIndex(s => s.key === step);

    const renderStepContent = () => {
        switch (step) {
            case 'package':
                return <PackageSelection packages={cw_packages} onSelect={pkg => { setSelectedPackage(pkg); handleNextStep(); }} />;
            case 'instructor':
                return <InstructorSelection instructors={instructors} onSelect={inst => { setSelectedInstructor(inst); handleNextStep(); }} />;
            case 'child':
                 if (!currentUser) return <p>Please log in.</p>
                return <ChildSelection childProfiles={childProfiles} onSelect={child => { setSelectedChild(child); handleNextStep(); }} />;
            case 'calendar':
                if (!selectedInstructor) return <p>Please select an instructor first.</p>
                return <CalendarSelection instructor={selectedInstructor} onSelect={(date, time) => { setSelectedDateTime({ date, time }); handleNextStep(); }} holidays={holidays} />;
            case 'confirm':
                return <div className="text-center"><h2 className="text-2xl font-bold">يرجى مراجعة تفاصيل الحجز.</h2></div>;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                 <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-5 gap-2 mb-12">
                         {steps.map((s, index) => (
                            <BookingStep 
                                key={s.key}
                                title={s.title}
                                stepNumber={s.stepNumber}
                                isActive={currentStepIndex === index}
                                isComplete={currentStepIndex > index}
                            />
                         ))}
                    </div>
                    
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border">
                           {currentStepIndex > 0 && (
                                <button onClick={handleBackStep} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
                                    <ArrowLeft size={16} />
                                    <span>العودة للخطوة السابقة</span>
                                </button>
                           )}
                           {renderStepContent()}
                        </div>
                        <div className="lg:col-span-1 sticky top-24">
                            <BookingSummary 
                                pkg={selectedPackage}
                                instructor={selectedInstructor}
                                child={selectedChild}
                                dateTime={selectedDateTime}
                                onConfirm={handleConfirmBooking}
                                isSubmitting={isSubmitting}
                                step={step}
                            />
                        </div>
                    </div>

                 </div>
            </div>
        </div>
    );
};

export default CreativeWritingBookingPage;