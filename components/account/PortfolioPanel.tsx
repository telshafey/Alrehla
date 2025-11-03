import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserAccountData, type EnrichedBooking, type SessionAttachment } from '../../hooks/queries/user/useUserDataQuery';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../ui/PageLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { FileText, Download, GalleryVertical, Users } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Button } from '../ui/Button';

type PortfolioItem = SessionAttachment & {
    journeyName: string;
    childName: string;
    uploader: string;
};

const PortfolioPanel: React.FC = () => {
    const { data, isLoading, error } = useUserAccountData();
    const { currentUser } = useAuth();

    const itemsByChild = useMemo((): Record<string, PortfolioItem[]> => {
        if (!data?.attachments || !data.userBookings) {
            return {};
        }
        
        const validAttachments: SessionAttachment[] = Array.isArray(data.attachments) ? data.attachments : [];
        const validJourneys: EnrichedBooking[] = Array.isArray(data.userBookings) ? data.userBookings : [];

        // Create a map for quick journey lookups to improve performance
        const journeyMap = new Map<string, EnrichedBooking>(validJourneys.map(j => [j.id, j]));

        const portfolioItems: PortfolioItem[] = validAttachments
            .map((att): PortfolioItem | null => {
                const journey = journeyMap.get(att.booking_id);

                if (!journey || !journey.child_profiles) {
                    return null;
                }
                
                const uploaderRoleMap: Record<string, string> = {
                    instructor: 'المدرب',
                    student: journey.child_profiles?.name || 'الطالب',
                    user: 'ولي الأمر'
                };
                const uploaderDisplay = uploaderRoleMap[att.uploader_role] || 'غير معروف';
                
                return {
                    ...att,
                    journeyName: journey.packageDetails?.name || 'رحلة تدريبية',
                    childName: journey.child_profiles.name,
                    uploader: uploaderDisplay,
                };
            })
            .filter((item): item is PortfolioItem => item !== null);

        // Group the valid items by child name
        const groupedByChild = portfolioItems.reduce<Record<string, PortfolioItem[]>>((acc, item) => {
            const childName = item.childName;
            if (!acc[childName]) {
                acc[childName] = [];
            }
            acc[childName].push(item);
            return acc;
        }, {});
        
        // Sort items within each child's group
        for (const childName in groupedByChild) {
            groupedByChild[childName].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return groupedByChild;
    }, [data, currentUser]);


    if (isLoading) {
        return <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg"><PageLoader text="جاري تحميل معرض الأعمال..." /></div>;
    }

    if (error || !data) {
        const errorMessage = (error as Error)?.message || 'حدث خطأ في تحميل بياناتك.';
        return <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center text-red-500 py-20">{errorMessage}</div>;
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <GalleryVertical /> معرض أعمال العائلة
            </h2>

            {Object.keys(itemsByChild).length > 0 ? (
                <div className="space-y-10">
                    {Object.entries(itemsByChild).map(([childName, portfolioItemsForChild]) => (
                        <div key={childName}>
                            <h3 className="text-xl font-bold text-gray-700 mb-4 border-r-4 border-primary pr-3 flex items-center gap-2">
                                <Users size={20} /> {childName}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.isArray(portfolioItemsForChild) && portfolioItemsForChild.map((item) => (
                                    <Card key={item.id} className="flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-primary flex-shrink-0" />
                                                <CardTitle className="truncate text-lg">{item.file_name}</CardTitle>
                                            </div>
                                            <CardDescription>
                                                ضمن: {item.journeyName}
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
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <GalleryVertical className="mx-auto h-16 w-16 text-gray-400/50" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">لا توجد أعمال لعرضها</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">عندما يتم رفع أي ملفات في الرحلات التدريبية الخاصة بأطفالك، ستظهر هنا.</p>
                </div>
            )}
        </div>
    );
};

export default PortfolioPanel;