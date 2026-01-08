
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionDetails } from '../../../hooks/queries/user/useJourneyDataQuery';
import { useBookingMutations } from '../../../hooks/mutations/useBookingMutations';
import { useGamificationMutations } from '../../../hooks/mutations/useGamificationMutations';
import { usePublicData } from '../../../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../../../components/ui/PageLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import FormField from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { CheckCircle, ArrowRight, Star, Award, User } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';

const SessionReportPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { data: session, isLoading: sessionLoading } = useSessionDetails(sessionId);
    const { updateScheduledSession } = useBookingMutations();
    const { awardBadge } = useGamificationMutations();
    const { data: publicData } = usePublicData();

    const [notes, setNotes] = useState('');
    const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session?.notes) setNotes(session.notes);
    }, [session]);

    if (sessionLoading) return <PageLoader text="جاري تحميل بيانات الجلسة..." />;
    if (!session) return <div className="p-20 text-center">عذراً، لم يتم العثور على الجلسة.</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // 1. تحديث حالة الجلسة وحفظ الملاحظات
            await updateScheduledSession.mutateAsync({
                sessionId: session.id,
                updates: {
                    status: 'completed',
                    notes: notes
                }
            });

            // 2. منح الشارة للطالب
            if (selectedBadgeId) {
                await awardBadge.mutateAsync({
                    childId: session.child_id,
                    badgeId: parseInt(selectedBadgeId),
                    instructorId: session.instructor_id
                });
            }

            navigate('/admin');
        } catch (error) {
            console.error("Report saving failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-muted/30 min-h-screen py-12 animate-fadeIn" dir="rtl">
            <div className="container mx-auto px-4 max-w-3xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors">
                    <ArrowRight size={18} />
                    العودة للوحة التحكم
                </button>

                <div className="space-y-6">
                    <Card className="border-t-4 border-primary">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <User size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">تقرير إنجاز الجلسة</CardTitle>
                                    <CardDescription>
                                        الطالب: <span className="font-bold text-foreground">{session.child_profiles?.name || 'غير معروف'}</span> | 
                                        تاريخ الجلسة: {formatDate(session.session_date)}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <Award className="text-blue-600 mt-1 shrink-0" />
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        سيتم إرسال هذا التقرير إلى ولي أمر الطالب فور الحفظ. ساعدهم على فهم نقاط القوة ومستوى التقدم الذي أحرزه طفله اليوم.
                                    </p>
                                </div>

                                <FormField label="ملاحظات الأداء والتقدم (إلزامي)" htmlFor="notes">
                                    <Textarea 
                                        id="notes"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="صف بوضوح ما تم إنجازه، نقاط القوة، وما يحتاج الطالب للتركيز عليه في المرة القادمة..."
                                        rows={8}
                                        required
                                        className="text-lg leading-relaxed bg-white"
                                    />
                                </FormField>

                                <div className="pt-6 border-t">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Star className="text-yellow-500" /> تكريم الطالب (شارة إبداع)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="اختر شارة لتميز الطالب اليوم" htmlFor="badge">
                                            <Select 
                                                id="badge" 
                                                value={selectedBadgeId} 
                                                onChange={e => setSelectedBadgeId(e.target.value)}
                                                className="bg-white"
                                            >
                                                <option value="">-- بدون شارة تشجيعية --</option>
                                                {publicData?.badges?.map((b: any) => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </Select>
                                        </FormField>
                                        {selectedBadgeId && (
                                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                                                <p className="font-bold">وصف الشارة:</p>
                                                <p>{publicData?.badges?.find((b:any) => b.id == selectedBadgeId)?.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        className="flex-1 shadow-lg h-14 text-lg font-black" 
                                        loading={isSubmitting}
                                        icon={<CheckCircle />}
                                    >
                                        حفظ التقرير وإغلاق الجلسة
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="lg" 
                                        onClick={() => navigate('/admin')}
                                        disabled={isSubmitting}
                                    >
                                        إلغاء
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SessionReportPage;
