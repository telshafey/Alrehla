import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import type { CreativeWritingBooking } from '../../lib/database.types';

// The journey object is a booking with enriched data
type EnrichedBooking = CreativeWritingBooking & {
    instructor_name?: string;
    child_profiles?: { name: string } | null;
};

interface JourneyCardProps {
    journey: EnrichedBooking;
    userRole: 'student' | 'instructor';
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey, userRole }) => {
    const title = journey.package_name;
    const subtitle = userRole === 'student'
        ? `مع المدرب: ${journey.instructor_name || 'غير محدد'}`
        : `مع الطالب: ${journey.child_profiles?.name || 'غير محدد'}`;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                    <BookOpen />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>
            <Link 
                to={`/journey/${journey.id}`} 
                className="flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors self-end sm:self-center"
            >
                <span>افتح مساحة العمل</span>
                <ArrowLeft size={16} />
            </Link>
        </div>
    );
};

export default JourneyCard;
