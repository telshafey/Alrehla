import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentDashboardData } from '../../hooks/userQueries';
import PageLoader from '../../components/ui/PageLoader';
import { Link } from 'react-router-dom';
import { Calendar, Video, BookOpen, Clock, Frown, CheckCircle, FileText, Gamepad2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

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

        {/* Digital Portfolio Section */}
        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><BookOpen className="text-purple-500"/> محفظتي الرقمية</h2>
          {completedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedSessions.map(session => (
                <div key={session.id} className="p-6 border rounded-2xl bg-gray-50 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="text-purple-500" />
                    <h3 className="font-bold text-gray-800">{session.package_name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{formatDate(session.booking_date)}</p>
                  
                  {session.progress_notes ? (
                     <div className="mt-auto pt-3 border-t text-sm text-gray-700 bg-white p-4 rounded-md flex-grow">
                        <p className="font-semibold mb-2">ملاحظات المدرب وإنجازات الجلسة:</p>
                        <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{session.progress_notes}</p>
                     </div>
                  ) : (
                    <p className="mt-auto text-sm text-gray-500 italic">لا توجد ملاحظات لهذه الجلسة بعد.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8">
              <p className="text-gray-600">ستظهر أعمالك الإبداعية هنا بعد إكمال الجلسات.</p>
            </div>
          )}
        </section>
        
        {/* Interactive Activities Placeholder */}
        <section className="bg-white p-8 rounded-2xl shadow-lg">
           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Gamepad2 className="text-orange-500"/> الأنشطة التفاعلية</h2>
           <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">ترقبوا قريباً! مساحة جديدة مليئة بالأنشطة والألعاب الإبداعية.</p>
           </div>
        </section>

      </div>
    );
};

export default StudentDashboardPage;