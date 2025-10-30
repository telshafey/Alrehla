import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock } from 'lucide-react';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';

type EnrichedStudentBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails?: CreativeWritingPackage;
    instructor_name?: string;
};

interface StudentJourneyCardProps {
    journey: EnrichedStudentBooking;
}

const StudentJourneyCard: React.FC<StudentJourneyCardProps> = ({ journey }) => {
    const upcomingSessions = journey.sessions
        .filter(s => s.status === 'upcoming')
        .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
    
    const nextSession = upcomingSessions[0];

    return (
        <Card className="transition-transform transform hover:-translate-y-1">
            <CardHeader className="flex-row gap-4 items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full flex-shrink-0"><BookOpen /></div>
                <div>
                    <CardTitle>{journey.package_name}</CardTitle>
                    <CardDescription>مع المدرب: {journey.instructor_name}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {nextSession && (
                    <div>
                        <h4 className="text-sm font-bold text-muted-foreground mb-2">جلستك القادمة:</h4>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <Clock size={16} className="text-primary" />
                            <p className="text-sm font-semibold">{formatDate(nextSession.session_date)} - {new Date(nextSession.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                )}
            </CardContent>
             <CardFooter>
                 <Link to={`/journey/${journey.id}`} className="flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors w-full sm:w-auto">
                    <span>افتح مساحة العمل</span>
                    <ArrowLeft size={16} />
                </Link>
             </CardFooter>
        </Card>
    );
};

export default React.memo(StudentJourneyCard);