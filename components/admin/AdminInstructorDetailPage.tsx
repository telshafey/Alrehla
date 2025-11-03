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
import { ArrowLeft, Save, User, AlertCircle, Check, XCircle, FileEdit, Calendar, DollarSign } from 'lucide-react';
import type { Instructor, WeeklySchedule } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Image from '../ui/Image';

const dayNames: { [key: string]: string } = {
    saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء',
    thursday: 'الخميس', friday: 'الجمعة'
};

const ChangeDisplay: React.FC<{ label: string, oldValue: any, newValue: any }> = ({ label, oldValue, newValue }) => (
    <div className="text-xs">
        <strong className="font-semibold text-foreground">{label}:</strong>
        <p className="font-mono p-1 bg-red-100 text-red-700 rounded-md my-1 line-through">{oldValue || 'غير محدد'}</p>
        <p className="font-mono p-1 bg-green-100 text-green-700 rounded-md">{newValue || 'غير محدد'}</p>
    </div>
);

const AdminInstructorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { data: settingsData, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useAdminCWSettings();
    const { createInstructor, updateInstructor, approveInstructorProfileUpdate, rejectInstructorProfileUpdate, approveInstructorSchedule, rejectInstructorSchedule } = useInstructorMutations();
    
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
                    return <ChangeDisplay key={key} label={key} oldValue={(instructor as any)[key]} newValue={updates[key]} />
                })}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <Link to="/admin/instructors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة إلى قائمة المدربين
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground">
                {isNew ? 'إضافة مدرب جديد' : `إدارة ملف: ${instructor?.name}`}
            </h1>
            
            {!isNew && instructor && (
                <>
                    {instructor.profile_update_status === 'pending' && (
                        <Card border="border-yellow-400">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-600"><FileEdit /> طلب تحديث الملف الشخصي والأسعار</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {renderPendingProfileUpdates()}
                                <p className="text-xs mt-4 pt-2 border-t font-semibold">المبرر: <span className="font-normal text-muted-foreground">{instructor.pending_profile_data?.justification}</span></p>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="success" size="sm" onClick={() => approveInstructorProfileUpdate.mutate({instructorId: instructor.id})} icon={<Check />}>موافقة</Button>
                                    <Button variant="destructive" size="sm" onClick={() => rejectInstructorProfileUpdate.mutate({instructorId: instructor.id})} icon={<XCircle />}>رفض</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {instructor.schedule_status === 'pending' && (
                         <Card border="border-yellow-400">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-600"><Calendar /> طلب تحديث الجدول الأسبوعي</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    {Object.entries((instructor.weekly_schedule as WeeklySchedule) || {}).map(([day, times]) => (
                                        (Array.isArray(times) && times.length > 0) && <p key={day}><span className="font-semibold text-foreground">{dayNames[day as keyof typeof dayNames]}:</span> {times.join(', ')}</p>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="success" size="sm" onClick={() => approveInstructorSchedule.mutate({instructorId: instructor.id})} icon={<Check />}>موافقة</Button>
                                    <Button variant="destructive" size="sm" onClick={() => rejectInstructorSchedule.mutate({instructorId: instructor.id})} icon={<XCircle />}>رفض</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User /> الملف الشخصي للمدرب</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField label="الصورة الرمزية" htmlFor="avatarFile">
                            <div className="flex items-center gap-4">
                                <Image src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full" />
                                <Input type="file" id="avatarFile" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </FormField>
                        <FormField label="اسم المدرب" htmlFor="name">
                            <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} required />
                        </FormField>
                        <FormField label="التخصص" htmlFor="specialty">
                            <Input id="specialty" name="specialty" value={profile.specialty} onChange={handleProfileChange} />
                        </FormField>
                        <FormField label="معرّف الرابط (Slug)" htmlFor="slug">
                            <Input id="slug" name="slug" value={profile.slug} onChange={handleProfileChange} placeholder="مثال: ahmed-masri" required />
                        </FormField>
                        <FormField label="نبذة تعريفية" htmlFor="bio">
                            <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={5} />
                        </FormField>
                    </CardContent>
                </Card>
                 <div className="flex justify-end sticky bottom-6 mt-8">
                    <Button type="submit" loading={isSaving} size="lg" icon={<Save />}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminInstructorDetailPage;
