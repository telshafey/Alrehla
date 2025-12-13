
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminUsers } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save, User, AlertCircle, Check, XCircle, FileEdit, Calendar, UserPlus } from 'lucide-react';
import type { Instructor, WeeklySchedule } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Image from '../../components/ui/Image';

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
    const { data: users = [], isLoading: usersLoading } = useAdminUsers();
    const { data: settingsData, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useAdminCWSettings();
    const { createInstructor, updateInstructor, approveInstructorProfileUpdate, rejectInstructorProfileUpdate, approveInstructorSchedule, rejectInstructorSchedule } = useInstructorMutations();
    
    // Add email to initial state
    const [profile, setProfile] = useState<Partial<Instructor>>({ name: '', email: '', specialty: '', slug: '', bio: '', user_id: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const instructor = !isNew ? instructors.find(i => i.id === parseInt(id!)) : null;

    // Filter available users for new instructor creation
    const availableCandidates = useMemo(() => {
        if (!users) return [];
        return users.filter(user => 
            user.role === 'instructor' && 
            !instructors.some(inst => inst.user_id === user.id)
        );
    }, [users, instructors]);

    useEffect(() => {
        if (instructor) {
            setProfile(instructor);
            setPreview(instructor.avatar_url || null);
        }
    }, [instructor]);

    const isLoading = instructorsLoading || settingsLoading || usersLoading;
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

    const handleUserSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = e.target.value;
        const selectedUser = users.find(u => u.id === selectedUserId);
        if (selectedUser) {
            setProfile(prev => ({
                ...prev,
                user_id: selectedUser.id,
                name: selectedUser.name, 
                email: selectedUser.email // Set email from user profile
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) {
            // عند الإنشاء بواسطة الإدارة، نعتبر الحالة معتمدة تلقائياً
            await createInstructor.mutateAsync({ 
                ...profile, 
                avatarFile,
                schedule_status: 'approved',
                profile_update_status: 'approved',
                rate_per_session: profile.rate_per_session || 0
            });
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
                        {isNew ? (
                            <div className="space-y-4">
                                <FormField label="اختر المستخدم (يجب أن يكون دوره 'مدرب' في النظام)" htmlFor="user_id">
                                    <Select 
                                        id="user_id" 
                                        name="user_id" 
                                        value={profile.user_id || ''} 
                                        onChange={handleUserSelection}
                                        required
                                    >
                                        <option value="" disabled>-- اختر مستخدماً من القائمة --</option>
                                        {availableCandidates.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </Select>
                                </FormField>
                                {availableCandidates.length === 0 && (
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">لا يوجد مستخدمون متاحون.</p>
                                            <p className="mt-1">يجب أولاً إنشاء حساب مستخدم وتعيين دوره كـ "مدرب"، أو تعديل دور مستخدم حالي من صفحة المستخدمين.</p>
                                            <Link to="/admin/users" className="text-primary hover:underline mt-2 inline-flex items-center gap-1 font-semibold">
                                                الذهاب لإدارة المستخدمين <UserPlus size={14}/>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                <FormField label="اسم المدرب" htmlFor="name">
                                    <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} required />
                                </FormField>
                                <FormField label="البريد الإلكتروني" htmlFor="email">
                                    <Input id="email" name="email" value={profile.email} onChange={handleProfileChange} />
                                </FormField>
                            </div>
                        ) : (
                            <>
                                <FormField label="اسم المدرب" htmlFor="name">
                                    <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} required />
                                </FormField>
                                <FormField label="البريد الإلكتروني" htmlFor="email">
                                    <Input id="email" name="email" value={profile.email} onChange={handleProfileChange} />
                                </FormField>
                            </>
                        )}

                        <FormField label="الصورة الرمزية" htmlFor="avatarFile">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Image src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full" />
                                    <span className="absolute bottom-0 right-0 text-[10px] bg-black/50 text-white px-1 rounded">400x400</span>
                                </div>
                                <div className="flex-grow">
                                    <Input type="file" id="avatarFile" onChange={handleFileChange} accept="image/*" />
                                    <p className="text-[10px] text-muted-foreground mt-1">يفضل صورة مربعة (400x400 بكسل).</p>
                                </div>
                            </div>
                        </FormField>
                        
                        <FormField label="التخصص" htmlFor="specialty">
                            <Input id="specialty" name="specialty" value={profile.specialty} onChange={handleProfileChange} placeholder="مثال: كتابة القصة القصيرة، أدب الطفل" />
                        </FormField>
                        <FormField label="معرّف الرابط (Slug)" htmlFor="slug">
                            <Input id="slug" name="slug" value={profile.slug} onChange={handleProfileChange} placeholder="مثال: ahmed-masri" required dir="ltr" />
                        </FormField>
                        <FormField label="نبذة تعريفية" htmlFor="bio">
                            <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={5} placeholder="نبذة مختصرة تظهر للطلاب..." />
                        </FormField>
                    </CardContent>
                </Card>
                 <div className="flex justify-end sticky bottom-6 mt-8">
                    <Button type="submit" loading={isSaving} size="lg" icon={<Save />} disabled={isNew && !profile.user_id}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminInstructorDetailPage;
