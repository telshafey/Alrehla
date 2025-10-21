import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries.ts';
import { Loader2, Star, Quote, Calendar } from 'lucide-react';
import BookingCalendar from '../components/BookingCalendar.tsx';
import ShareButtons from '../components/shared/ShareButtons.tsx';

const InstructorProfilePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading, error } = usePublicData();
    const instructors = data?.instructors || [];
    const pageUrl = window.location.href;

    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);

    const instructor = instructors.find(i => i.slug === slug);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12 text-blue-500" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-20">{error.message}</div>;
    }

    if (!instructor) {
        return <div className="text-center py-20">لم يتم العثور على المدرب.</div>;
    }

    const handleDateTimeSelect = (date: Date, time: string) => {
        setSelectedDateTime({ date, time });
    };

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Instructor Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg sticky top-24 text-center">
                            <img 
                                src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                                alt={instructor.name}
                                className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-blue-200"
                            />
                            <h1 className="text-3xl font-bold text-gray-800 mt-4">{instructor.name}</h1>
                            <p className="text-lg text-blue-600 font-semibold">{instructor.specialty}</p>
                            <p className="text-gray-600 mt-4 text-sm leading-relaxed">{instructor.bio}</p>
                             <div className="mt-6 pt-6 border-t flex justify-center">
                                <ShareButtons 
                                    title={`تعرف على المدرب ${instructor.name} في منصة الرحلة`}
                                    url={pageUrl}
                                    label="شارك الملف:"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking and Reviews */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Calendar /> حجز موعد</h2>
                            <BookingCalendar instructor={instructor} onDateTimeSelect={handleDateTimeSelect} />
                            {selectedDateTime && (
                                <div className="mt-6 text-center">
                                    <p className="font-semibold">
                                        تم اختيار: {selectedDateTime.date.toLocaleDateString('ar-EG')} الساعة {selectedDateTime.time}
                                    </p>
                                    <Link to="/creative-writing/booking" state={{ instructor, selectedDateTime }} className="mt-4 inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700">
                                        الانتقال لإكمال الحجز
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Star /> آراء الطلاب</h2>
                            <div className="space-y-6">
                                {/* Dummy Review */}
                                <div className="p-4 border-l-4 border-blue-300 bg-blue-50">
                                    <Quote className="w-6 h-6 text-blue-200 transform rotate-180 mb-2" />
                                    <p className="italic text-gray-700">"مدرب رائع! استطاع أن يبسط المفاهيم لابني ويجعله متحمساً للكتابة."</p>
                                    <p className="text-right font-bold text-gray-800 mt-2">- خالد عبد الرحمن</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfilePage;