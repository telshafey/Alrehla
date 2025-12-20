
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save, User, AlertCircle, Check, XCircle, FileEdit, Calendar, DollarSign, Clock, Star } from 'lucide-react';
import type { Instructor, WeeklySchedule } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Image from '../ui/Image';
// Import formatDate helper
import { formatDate } from '../../utils/helpers';

const dayNames: { [key: string]: string } = {
    saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء',
    thursday: 'الخميس', friday: 'الجمعة'
};

const ChangeDisplay: React.FC<{ label: string, oldValue: any, newValue: any }> = ({ label, oldValue, newValue }) => {
    // If it's an object (like schedule or rates), we might need special handling but for simple strings:
    const isDifferent = JSON.stringify(oldValue) !== JSON.stringify(newValue);
    if (!isDifferent) return null;

    return (
        <div className="bg-white p-3 rounded border mb-2">
            <strong className="block text-sm font-semibold text-gray-700 mb-2">{label}:</strong>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2 bg-red-50 text-red-700 rounded text-xs border border-red-100">
                    <span className="block font-bold mb-1 opacity-60">القيمة الحالية:</span>
                    {typeof oldValue === 'object' ? JSON.stringify(oldValue) : (oldValue || 'فارغ')}
                </div>
                <div className="p-2 bg-green-50 text-green-700 rounded text-xs border border-green-100">
                    <span className="block font-bold mb-1 opacity-60">القيمة المقترحة:</span>
                    {typeof newValue === 'object' ? JSON.stringify(newValue) : (newValue || 'فارغ')}
                </div>
            </div>
        </div>
    );
};

const AdminInstructorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { data: settingsData, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useAdminCWSettings();
    const { 
        createInstructor, 
        updateInstructor, 
        approveInstructorProfileUpdate, 
        rejectInstructorProfileUpdate, 
        approveInstructorSchedule, 
        rejectInstructorSchedule 
    } = useInstructorMutations();
    
    const [profile, setProfile] = useState<Partial<Instructor>>({ name: '', specialty: '', slug: '', bio: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const instructor = !isNew ? instructors.find(i => i.id === parseInt(id!)) : null;

    useEffect(() => {
        if (instructor) {
            setProfile(instructor);
            setPreview(instructor.avatar_url || null);
        }
    }, [instructor]);

    const isLoading = instructorsLoading || settingsLoading;
    const isSaving = createInstructor.isPending || updateInstructor.isPending;
    const error = instructorsError || settingsError;

    if (isLoading && !isNew) return <PageLoader />;
    if (!isNew && !isLoading && !instructor) return <ErrorState message="لم يتم العثور على المدرب" onRetry={() => navigate('/admin/instructors')} />;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(instructor?.avatar_url || null);
        }
    };
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) {
            await createInstructor.mutateAsync({ ...profile, avatarFile });
        } else {
            await updateInstructor.mutateAsync({ ...profile, avatarFile });
        }
        navigate('/admin/instructors');
    };

    const renderPendingProfileUpdates = () => {
        if (!instructor || instructor.profile_update_status !== 'pending' || !instructor.pending_profile_data?.updates) return null;
        const updates = instructor.pending_profile_data.updates;
        
        return (
            <div className="space-y-2">
                {Object.keys(updates).map(key => {
                    if (key === 'service_rates' || key === 'package_rates') {
                         return Object.keys(updates[key]).map(itemId => {
                            const itemName = (settingsData?.[key === 'service_rates' ? 'standaloneServices' : 'packages'] as any[])?.find(item => item.id == itemId)?.name || `ID: ${itemId}`;
                            return <ChangeDisplay key={`${key}-${itemId}`} label={`سعر: ${itemName}`} oldValue={(instructor as any)[key]?.[itemId]} newValue={updates[key][itemId]} />
                        });
                    }
                    return <ChangeDisplay key={key} label={key === 'rate_per_session' ? 'سعر الجلسة الأساسي' : key} oldValue={(instructor as any)[key]} newValue={updates[key]} />
                })}
            </div>
        );
    };

    const renderPendingScheduleUpdates = () => {
        if (!instructor || instructor.schedule_status !== 'pending' || !instructor.pending_profile_data?.proposed_schedule) return null;
        const proposed = instructor.pending_profile_data.proposed_schedule;
        const current = instructor.weekly_schedule || {};

        return (
            <div className="space-y-4">
                {Object.keys(proposed).map(day => (
                    <div key={day} className="bg-white p-3 rounded border">
                        <h5 className="font-bold text-sm mb-2">{dayNames[day]}</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-xs">
                                <span className="text-muted-foreground block mb-1">الحالي:</span>
                                <div className="flex flex-wrap gap-1">
                                    {(current[day] || []).length > 0 ? current[day].map((t: string) => <span key={t} className="px-1 bg-gray-100 rounded">{t}</span>) : '-'}
                                </div>
                            </div>
                            <div className="text-xs">
                                <span className="text-green-600 font-bold block mb-1">المقترح:</span>
                                <div className="flex flex-wrap gap-1">
                                    {(proposed[day] || []).length > 0 ? proposed[day].map((t: string) => <span key={t} className="px-1 bg-green-100 text-green-800 rounded font-bold">{t}</span>) : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn space-y-8 max-w-5xl mx-auto pb-20">
            <Link to="/admin/instructors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة إلى قائمة المدربين
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground">
                {isNew ? 'إضافة مدرب جديد' : `إدارة ملف: ${instructor?.name}`}
            </h1>
            
            {!isNew && instructor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pending Data Section */}
                    {instructor.profile_update_status === 'pending' && (
                        <Card className="border-2 border-orange-400 shadow-lg bg-orange-50/10">
                            <CardHeader className="bg-orange-400/10 border-b border-orange-200">
                                <CardTitle className="flex items-center gap-2 text-orange-700"><FileEdit /> تحديث البيانات والأسعار</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {renderPendingProfileUpdates()}
                                <div className="p-3 bg-muted/50 rounded-lg mt-4 text-xs">
                                    <p className="font-bold mb-1">مبرر الطلب:</p>
                                    <p>{instructor.pending_profile_data?.justification || 'لا يوجد مبرر مكتوب'}</p>
                                    <p className="mt-2 text-muted-foreground">التوقيت: {formatDate(instructor.pending_profile_data?.requested_at)}</p>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="success" className="flex-1" onClick={() => approveInstructorProfileUpdate.mutate({instructorId: instructor.id})} loading={approveInstructorProfileUpdate.isPending} icon={<Check />}>اعتماد التعديلات</Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => rejectInstructorProfileUpdate.mutate({instructorId: instructor.id})} loading={rejectInstructorProfileUpdate.isPending} icon={<XCircle />}>رفض الطلب</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {instructor.schedule_status === 'pending' && (
                         <Card className="border-2 border-blue-400 shadow-lg bg-blue-50/10">
                            <CardHeader className="bg-blue-400/10 border-b border-blue-200">
                                <CardTitle className="flex items-center gap-2 text-blue-700"><Clock /> تحديث الجدول الأسبوعي</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {renderPendingScheduleUpdates()}
                                <div className="flex gap-3 mt-6">
                                    <Button variant="success" className="flex-1" onClick={() => approveInstructorSchedule.mutate({instructorId: instructor.id})} loading={approveInstructorSchedule.isPending} icon={<Check />}>اعتماد الجدول</Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => rejectInstructorSchedule.mutate({instructorId: instructor.id})} loading={rejectInstructorSchedule.isPending} icon={<XCircle />}>رفض الطلب</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User /> الملف الشخصي الحالي (على الموقع)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField label="الصورة الرمزية" htmlFor="avatarFile">
                            <div className="flex items-center gap-4">
                                <Image src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full border shadow-sm" />
                                <Input type="file" id="avatarFile" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="اسم المدرب" htmlFor="name">
                                <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} required />
                            </FormField>
                            <FormField label="التخصص" htmlFor="specialty">
                                <Input id="specialty" name="specialty" value={profile.specialty} onChange={handleProfileChange} />
                            </FormField>
                        </div>
                        <FormField label="معرّف الرابط (Slug)" htmlFor="slug">
                            <Input id="slug" name="slug" value={profile.slug} onChange={handleProfileChange} placeholder="مثال: ahmed-masri" required dir="ltr" />
                        </FormField>
                        <FormField label="نبذة تعريفية" htmlFor="bio">
                            <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={5} />
                        </FormField>
                        
                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" loading={isSaving} icon={<Save />}>
                                {isNew ? 'إضافة مدرب' : 'تحديث البيانات مباشرة'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminInstructorDetailPage;
