
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminPersonalizedProducts } from '../../../hooks/queries/admin/useAdminEnhaLakQuery';
import PageLoader from '../../../components/ui/PageLoader';
import StatCard from '../../../components/admin/StatCard';
import { Library, PlusCircle, CheckCircle, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const PublisherDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    // This hook will now filter by RLS, so it only returns the publisher's products
    const { data: products = [], isLoading } = useAdminPersonalizedProducts();

    if (isLoading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    const activeBooks = products.filter(p => p.is_active !== false).length;
    const totalBooks = products.length;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">مرحباً، {currentUser?.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">لوحة تحكم دار النشر - إدارة الكتب والمطبوعات.</p>
                </div>
                <Button onClick={() => navigate('/admin/publisher-products/new?type=library_book')} icon={<PlusCircle size={18} />}>
                    إضافة كتاب جديد
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="إجمالي كتبي" 
                    value={totalBooks} 
                    icon={<Library className="h-4 w-4 text-blue-500" />} 
                    onClick={() => navigate('/admin/publisher-products')}
                />
                <StatCard 
                    title="كتب نشطة (معروضة)" 
                    value={activeBooks} 
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />} 
                />
                <StatCard 
                    title="مشاهدات الكتب" 
                    value="--" // Future implementation: Add analytics
                    icon={<Eye className="h-4 w-4 text-gray-500" />} 
                />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">تعليمات سريعة</h3>
                <ul className="list-disc list-inside text-blue-800 text-sm space-y-2">
                    <li>يمكنك إضافة كتب جديدة من نوع "كتب المكتبة" ليتم عرضها في المتجر العام.</li>
                    <li>تأكد من رفع صورة غلاف عالية الجودة لكل كتاب.</li>
                    <li>الكتب التي تقوم بإضافتها ستكون مرتبطة بحسابك تلقائياً.</li>
                </ul>
            </div>
        </div>
    );
};

export default PublisherDashboardPage;
