import React from 'react';
import { useUserAccountData } from '../../hooks/queries/user/useUserDataQuery';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../ui/PageLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { FileText, Download, GalleryVertical } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Button } from '../ui/Button';
import EmptyState from './EmptyState';

const PortfolioPanel: React.FC = () => {
    const { data, isLoading, error } = useUserAccountData();
    const { currentUser } = useAuth();

    if (isLoading) {
        return <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg"><PageLoader text="جاري تحميل معرض الأعمال..." /></div>;
    }

    if (error || !data) {
        const errorMessage = (error as Error)?.message || 'حدث خطأ في تحميل بياناتك.';
        return <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center text-red-500 py-20">{errorMessage}</div>;
    }

    const { attachments = [], userBookings: journeys = [] } = data;

    const portfolioItems = attachments.map((att: any) => {
        const journey = journeys.find((j: any) => j.id === att.booking_id);
        const uploaderIsCurrentUser = att.uploader_id === currentUser?.id;
        const uploaderRole = att.uploader_role === 'student' ? 'الطالب' : 'ولي الأمر';

        return {
            ...att,
            journeyName: journey?.package_name || 'رحلة تدريبية',
            childName: journey?.child_profiles?.name || currentUser?.name || 'غير معروف',
            uploader: uploaderIsCurrentUser ? 'أنت' : uploaderRole,
        };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <GalleryVertical /> معرض أعمالي
            </h2>

            {portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item: any) => (
                        <Card key={item.id} className="flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary flex-shrink-0" />
                                    <CardTitle className="truncate text-lg">{item.file_name}</CardTitle>
                                </div>
                                <CardDescription>
                                    للطالب: {item.childName} (ضمن: {item.journeyName})
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">
                                    تم الرفع بواسطة: {item.uploader}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    التاريخ: {formatDate(item.created_at)}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download size={16} className="ml-2" />
                                        عرض / تحميل
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <GalleryVertical className="mx-auto h-16 w-16 text-gray-400/50" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">لا توجد أعمال لعرضها</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">عندما يتم رفع أي ملفات في الرحلات التدريبية الخاصة بك أو بأطفالك، ستظهر هنا.</p>
                </div>
            )}
        </div>
    );
};

export default PortfolioPanel;