import React from 'react';
import { Link } from 'react-router-dom';

const CreativeWritingJoinUsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold">انضم لفريق مدربي "بداية الرحلة"</h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          هل لديك شغف بالكتابة وقدرة على إلهام العقول الصغيرة؟ نحن نبحث عنك!
      </p>
      <div className="mt-8">
        <Link to="/join-us" className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
            قدم طلبك الآن
        </Link>
      </div>
    </div>
  );
};

export default CreativeWritingJoinUsPage;