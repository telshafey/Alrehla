import React from 'react';
import { Button } from '../../ui/Button';
import { User, MessageSquarePlus } from 'lucide-react';

const InstructorStudentCard: React.FC<{ student: any; onRequestSupport: () => void; }> = ({ student, onRequestSupport }) => {
    const progressPercentage = student.totalSessions > 0 ? (student.completedSessions / student.totalSessions) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border flex flex-col h-full transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-4">
                <img
                    src={student.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">ID: {student.id}</p>
                </div>
            </div>
            
            <div className="mt-6 flex-grow">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-600 mb-1">
                    <span>تقدم الباقة</span>
                    <span>{student.completedSessions} / {student.totalSessions} جلسات</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" icon={<User />} className="flex-1">
                    عرض التفاصيل
                </Button>
                 <Button variant="subtle" size="sm" icon={<MessageSquarePlus />} className="flex-1" onClick={onRequestSupport}>
                    طلب جلسة دعم
                </Button>
            </div>
        </div>
    );
};

export default InstructorStudentCard;