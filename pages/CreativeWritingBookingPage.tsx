

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { usePublicData } from '../hooks/queries.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAppMutations } from '../hooks/mutations.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import type { CreativeWritingPackage, Instructor, ChildProfile } from '../lib/database.types.ts';
import BookingStep from '../components/creative-writing/booking/BookingStep.tsx';
import PackageSelection from '../components/creative-writing/booking/PackageSelection.tsx';
import InstructorSelection from '../components/creative-writing/booking/InstructorSelection.tsx';
import ChildSelection from '../components/creative-writing/booking/ChildSelection.tsx';
import CalendarSelection from '../components/creative-writing/booking/CalendarSelection.tsx';
import BookingSummary from '../components/creative-writing/BookingSummary.tsx';

type BookingStepType = 'package' | 'instructor' | 'child' | 'calendar' | 'confirm';

const CreativeWritingBookingPage: React.FC = () => {
    const { data, isLoading: dataLoading } = usePublicData();
    const { isLoggedIn, currentUser, childProfiles, loading: authLoading } = useAuth();
    const { createBooking } = useAppMutations();
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
            setStep('package'); // Start from package but with instructor pre-filled
        }
    }, [location.state]);

    const handlePackageSelect = (pkg: CreativeWritingPackage) => {
        setSelectedPackage(pkg);
        if (selectedInstructor) {
           setStep('calendar');
        } else {
           setStep('instructor');
        }
    };

    const handleInstructorSelect = (instructor: Instructor) => {
        setSelectedInstructor(instructor);
        setStep('calendar');
    };
    
    const handleDateTimeSelect = (date: Date, time: string) => {
        setSelectedDateTime({ date, time });
         if (currentUser?.role === 'guardian') {
            setStep('child');
        } else {
            // For regular users, we might skip child selection or handle it differently
            // For now, let's assume they need to add a child profile or we create one.
            addToast("يرجى إنشاء ملف طفل أولاً من حسابك.", "info");
            navigate('/account', { state: { defaultTab: 'family' } });
        }
    };
    
    const handleChildSelect = (child: ChildProfile) => {
        setSelectedChild(child);
        setStep('confirm');
    };

    const handleConfirm = async () => {
        if (!isLoggedIn || !currentUser) {
            navigate('/account', { state: { from: location } });
            return;
        }

        if (!selectedPackage || !selectedInstructor || !selectedDateTime || !selectedChild) {
            addToast('يرجى إكمال جميع خطوات الحجز.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            // FIX: Replaced mock booking creation with actual mutation call.
            const newBooking = await createBooking.mutateAsync({
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                instructorId: selectedInstructor.id,
                childId: selectedChild.id,
                userId: currentUser.id,
                userName: currentUser.name,
                total: selectedPackage.price,
                bookingDate: selectedDateTime.date.toISOString().split('T')[0],
                bookingTime: selectedDateTime.time,
            });
            navigate(`/checkout?type=booking&id=${newBooking.id}`);
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const goBack = () => {
        if (step === 'confirm') setStep('child');
        else if (step === 'child') setStep('calendar');
        else if (step === 'calendar') setStep('instructor');
        else if (step === 'instructor') setStep('package');
    };
    
    const isLoading = dataLoading || authLoading;
    if (isLoading) return <Loader2 className="animate-spin mx-auto my-12" />;

    const steps: {id: BookingStepType, title: string}[] = [
        { id: 'package', title: 'اختر الباقة' },
        { id: 'instructor', title: 'اختر المدرب' },
        { id: 'calendar', title: 'اختر الموعد' },
        { id: 'child', title: 'اختر الطفل' },
        { id: 'confirm', title: 'التأكيد والدفع' },
    ];
    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Bar */}
                    <div className="flex justify-between items-start mb-12">
                         {steps.map((s, index) => (
                             <BookingStep 
                                key={s.id}
                                stepNumber={index + 1}
                                title={s.title}
                                isActive={currentStepIndex === index}
                                isComplete={currentStepIndex > index}
                             />
                         ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
                            {step !== 'package' && (
                                <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
                                    <ArrowLeft size={16} className="transform rotate-180" />
                                    <span>رجوع</span>
                                </button>
                            )}

                            {step === 'package' && <PackageSelection packages={data?.cw_packages || []} onSelect={handlePackageSelect} />}
                            {step === 'instructor' && <InstructorSelection instructors={data?.instructors || []} onSelect={handleInstructorSelect} />}
                            {step === 'calendar' && selectedInstructor && <CalendarSelection instructor={selectedInstructor} onSelect={handleDateTimeSelect} />}
                            {step === 'child' && <ChildSelection childProfiles={childProfiles} onSelect={handleChildSelect} />}
                            {step === 'confirm' && (
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800">هل أنت مستعد لتأكيد الحجز؟</h2>
                                    <p className="text-gray-600 mt-2">يرجى مراجعة تفاصيل الحجز في الملخص على اليسار.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="md:col-span-1 sticky top-24">
                            <BookingSummary 
                                pkg={selectedPackage}
                                instructor={selectedInstructor}
                                dateTime={selectedDateTime}
                                child={selectedChild}
                                onConfirm={handleConfirm}
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
