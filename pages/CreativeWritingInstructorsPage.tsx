import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { usePublicData } from '../hooks/queries.ts';
import type { Instructor } from '../lib/database.types.ts';

const InstructorCard: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div className="bg-white rounded-2xl p-6 text-center border flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300 shadow-lg">
            <div className="relative w-24 h-24 mb-4">
                {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>}
                <img 
                    src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                    alt={instructor.name} 
                    className={`w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 shadow-md transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{instructor.name}</h3>
            <p className="text-blue-600 font-semibold mb-4 flex-grow">{instructor.specialty}</p>
            <Link 
                to={`/instructor/${instructor.slug}`}
                className="mt-auto w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition-colors"
            >
                عرض الملف الشخصي
            </Link>
        </div>
    );
};

const CreativeWritingInstructorsPage: React.FC = () => {
    const { data, isLoading, error } = usePublicData();
    const instructors = data?.instructors || [];

    return (
         <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">تعرف على مدربينا</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        فريقنا مكون من مدربين متخصصين وشغوفين بمساعدة الأطفال على اكتشاف أصواتهم الإبداعية.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>
                ) : error ? (
                    <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error.message}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {instructors.map(instructor => (
                           <InstructorCard key={instructor.id} instructor={instructor} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeWritingInstructorsPage;