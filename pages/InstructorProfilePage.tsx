import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import BookingCalendar from '../components/BookingCalendar';
import { Button } from '../components/ui/Button';

const InstructorProfilePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { data, isLoading, error } = usePublicData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل ملف المدرب..." />;
    }

    const instructor = data?.instructors.find(i => i.slug === slug);

    if (error) {
        return <div className="text-center text-red-500 py-12">{error.message}</div>;
    }

    if (!instructor) {
        return <div className="text-center py-12">لم يتم العثور على المدرب.</div>;
    }
    
    const handleDateTimeSelect = (date: Date, time: string) => {
        navigate('/creative-writing/booking', {
            state: {
                instructor: instructor,
                selectedDateTime: { date, time }
            }
        });
    };

    return (
        <div className="bg-gray-50 py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Instructor Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg text-center sticky top-24">
                            <img
                                src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'}
                                alt={instructor.name}
                                className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-blue-100"
                            />
                            <h1 className="text-3xl font-bold text-gray-800 mt-4">{instructor.name}</h1>
                            <p className="text-blue-600 font-semibold mt-1">{instructor.specialty}</p>
                            <p className="text-gray-600 mt-4 text-sm leading-relaxed">{instructor.bio}</p>
                        </div>
                    </div>

                    {/* Booking Calendar */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">احجز جلستك الأولى</h2>
                            <BookingCalendar instructor={instructor} onDateTimeSelect={handleDateTimeSelect} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfilePage;