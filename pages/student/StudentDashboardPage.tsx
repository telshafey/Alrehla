import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useStudentDashboardData } from '../../hooks/queries.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import { Link } from 'react-router-dom';
import { Calendar, Video, BookOpen, Clock, Frown, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers.ts';

const StudentDashboardPage: React.FC = () => {
    const { currentChildProfile, loading: authLoading } = useAuth();
    const { data, isLoading: dataLoading, error } = useStudentDashboardData();

    const isLoading = authLoading || dataLoading;

    if (isLoading) return <PageLoader text="جاري تحميل بياناتك..." />;
    if (error) return <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">{`خطأ في تحميل البيانات: ${error.message}`}</div>;
    if (!currentChildProfile) return <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">خطأ: لم يتم ربط حساب الطالب هذا بأي ملف طفل. يرجى التواصل مع الإدارة.</div>;

    const studentBookings = data?.studentBookings || [];

    const upcomingSessions = studentBookings.filter(b => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() - 1)))
      .sort((a,b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
    
    const completedSessions = studentBookings.filter(b => b.status === 'مكتمل')
      .sort((a,b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

    const nextSession = upcomingSessions[0];

    return (
      <div className="space-y-12 animate-fadeIn">
        {/* Next Session Section */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Calendar className="text-blue-500"/> جلستك القادمة</h2>
          {nextSession ? (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50 p-6 rounded-lg">
              <div>
                <p className="text-lg font-bold">{nextSession.package_name}</p>
                <p className="text-gray-600 flex items-center gap-2 mt-2"><Clock size={16}/> {formatDate(nextSession.booking_date)} - {nextSession.booking_time}</p>
              </div>
              <Link to={`/session/${nextSession.session_id}`} className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105">
                <Video size={20}/>
                <span>انضم للجلسة الآن</span>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Frown className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">لا توجد لديك جلسات قادمة محجوزة.</p>
            </div>
          )}
        </section>

        {/* Completed Sessions Section */}
        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><BookOpen className="text-green-500"/> الجلسات المكتملة وملاحظات المدرب</h2>
          {completedSessions.length > 0 ? (
            <div className="space-y-4">
              {completedSessions.map(session => (
                <div key={session.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="font-bold">{session.package_name} - <span className="font-normal text-gray-600">{formatDate(session.booking_date)}</span></p>
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full"><CheckCircle size={14}/> مكتمل</span>
                  </div>
                  {session.progress_notes ? (
                     <div className="mt-3 pt-3 border-t text-sm text-gray-700 bg-white p-3 rounded-md">
                        <p className="font-semibold mb-1">ملاحظات المدرب:</p>
                        <p className="whitespace-pre-wrap">{session.progress_notes}</p>
                     </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 italic">لا توجد ملاحظات لهذه الجلسة بعد.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8">
              <p className="text-gray-600">لم تكمل أي جلسات بعد.</p>
            </div>
          )}
        </section>
      </div>
    );
};

export default StudentDashboardPage;