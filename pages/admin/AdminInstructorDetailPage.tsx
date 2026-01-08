
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
import { ArrowLeft, Save, User, AlertCircle, Check, XCircle, FileEdit, Clock, DollarSign, Edit3 } from 'lucide-react';
import type { Instructor, WeeklySchedule } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import Image from '../ui/Image';
import { formatDate } from '../../utils/helpers';

const dayNames: { [key: string]: string } = {
    saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء',
    thursday: 'الخميس', friday: 'الجمعة'
};

const ValueFormatter: React.FC<{ value: any }> = ({ value }) => {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">فارغ</span>;
    
    if (Array.isArray(value)) {
        return (
            <ul className="space-y-1">
                {value.map((v, i) => (
                    <li key={i} className="border-b last:border-0 pb-1 flex items-center gap-2">
                        {typeof v === 'object' ? (
                            <span className="flex items-center gap-2 text-xs">
                                {v.title || 'بدون عنوان'}
                            </span>
                        ) : v.toString()}
                    </li>
                ))}
            </ul>
        );
    }
    
    if (typeof value === 'object') {
        if (Object.keys(value).some(k => dayNames[k])) {
            return (
                <div className="space-y-1 text-[10px]">
                    {Object.entries(value).map(([day, slots]) => (
                        <div key={day} className="flex justify-between border-b pb-0.5">
                            <span className="font-bold">{dayNames[day]}:</span>
                            <span>{Array.isArray(slots) ? slots.join(', ') : '-'}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return <pre className="text-[10px] bg-muted p-1 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    return <span>{value.toString()}</span>;
};

const ChangeDisplay: React.FC<{ label: string, oldValue: any, newValue: any }> = ({ label, oldValue, newValue }) => {
    return (
        <div className="bg-white p-3 rounded border mb-2 shadow-sm">
            <strong className="block text-sm font-semibold text-gray-700 mb-2">{label}:</strong>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2 bg-red-50 text-red-700 rounded text-xs border border-red-100">
                    <span className="block font-bold mb-1 opacity-60 underline">القيمة الحالية:</span>
                    <ValueFormatter value={oldValue} />
                </div>
                <div className="p-2 bg-green-50 text-green-700 rounded text-xs border border-green-100">
                    <span className="block font-bold mb-1 opacity-60 underline">القيمة المقترحة:</span>
                    <ValueFormatter value={newValue} />
                </div>
            </div>
        </div>
    );
};

const AdminInstructorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError } = useAdminInstructors();
    const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useAdminCWSettings();
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

    const [editablePendingUpdates, setEditablePendingUpdates] = useState<any>(null);

    const instructor = !isNew ? instructors.find(i => i.id === parseInt(id!)) : null;

    useEffect(() => {
        if (instructor) {
            setProfile(instructor);
            setPreview(instructor.avatar_url || null);
            
            if (instructor.profile_update_status === 'pending' && instructor.pending_profile_data?.updates) {
                setEditablePendingUpdates(JSON.parse(JSON.stringify(instructor.pending_profile_data.updates)));
            }
        }
    }, [instructor]);

    const isLoading = instructorsLoading || settingsLoading;
    const isSaving = createInstructor.isPending || updateInstructor.isPending;

    if (isLoading && !isNew) return <PageLoader />;
    if (!isNew && !isLoading && !instructor) return <ErrorState message="لم يتم العثور على المدرب" onRetry={() => navigate('/admin/instructors')} />;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePendingUpdateChange = (key: string, value: any) => {
        setEditablePendingUpdates((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { 
            name: profile.name!, 
            specialty: profile.specialty!, 
            slug: profile.slug!, 
            bio: profile.bio!, 
            avatarFile,
            id: profile.id
        };

        if (isNew) {
            await createInstructor.mutateAsync(payload);
        } else {
             // For update, we can pass partials, but name is required in mutation type def in hooks
            await updateInstructor.mutateAsync(payload);
        }
        navigate('/admin/instructors');
    };

    const handleApproveWithEdits = async () => {
        if (!instructor || !editablePendingUpdates) return;
        await approveInstructorProfileUpdate.mutateAsync({
            instructorId: instructor.id,
            modifiedUpdates: editablePendingUpdates
        });
    };

    const renderPendingProfileUpdates = () => {
        if (!instructor || instructor.profile_update_status !== 'pending' || !instructor.pending_profile_data?.updates) return null;
        const updates = instructor.pending_profile_data.updates;
        
        return (
            <div className="space-y-2">
                {Object.keys(updates).map(key => {
                    const labelMap: Record<string, string> = {
                        rate_per_session: 'سعر الجلسة الأساسي',
                        bio: 'النبذة التعريفية',
                        specialty: 'التخصص',
                        teaching_philosophy: 'فلسفة التدريب',
                        expertise_areas: 'مجالات الخبرة',
                        published_works: 'الأعمال المنشورة',
                        service_rates: 'أسعار الخدمات',
                        package_rates: 'أسعار الباقات'
                    };

                    if (key === 'service_rates' || key === 'package_rates') {
                         return Object.keys(updates[key]).map(itemId => {
                            const items = key === 'service_rates' ? settingsData?.standaloneServices : settingsData?.packages;
                            const itemName = (items as any[])?.find(item => item.id == itemId)?.name || `ID: ${itemId}`;
                            return <ChangeDisplay key={`${key}-${itemId}`} label={`سعر: ${itemName}`} oldValue={(instructor as any)[key]?.[itemId]} newValue={updates[key][itemId]} />
                        });
                    }
                    return <ChangeDisplay key={key} label={labelMap[key] || key} oldValue={(instructor as any)[key]} newValue={updates[key]} />
                })}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn space-y-8 max-w-5xl mx-auto pb-20">
            <Link to="/admin/instructors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة لقائمة المدربين
            </Link>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    <User /> {isNew ? 'إضافة مدرب جديد' : `إدارة ملف: ${instructor?.name}`}
                </h1>
                {!isNew && (
                    <Button type="submit" form="main-profile-form" loading={isSaving} icon={<Save />}>تحديث البيانات الحالية</Button>
                )}
            </div>
            
            {!isNew && instructor && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {instructor.profile_update_status === 'pending' && editablePendingUpdates && (
                        <Card className="border-2 border-orange-400 shadow-xl bg-orange-50/5 lg:col-span-2">
                            <CardHeader className="bg-orange-400/10 border-b border-orange-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-orange-700 font-black"><FileEdit /> مراجعة وتعديل طلب التحديث</CardTitle>
                                        <CardDescription className="text-orange-600">يمكنك تعديل القيم المقترحة أدناه قبل اعتمادها نهائياً.</CardDescription>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-orange-800">توقيت الطلب: {formatDate(instructor.pending_profile_data?.requested_at)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-gray-700 border-b pb-1">البيانات الشخصية المقترحة</h4>
                                    
                                    {editablePendingUpdates.name !== undefined && (
                                        <FormField label="الاسم المقترح" htmlFor="p-name">
                                            <Input id="p-name" value={editablePendingUpdates.name} onChange={e => handlePendingUpdateChange('name', e.target.value)} className="bg-white border-orange-200" />
                                        </FormField>
                                    )}
                                    
                                    {editablePendingUpdates.specialty !== undefined && (
                                        <FormField label="التخصص المقترح" htmlFor="p-specialty">
                                            <Input id="p-specialty" value={editablePendingUpdates.specialty} onChange={e => handlePendingUpdateChange('specialty', e.target.value)} className="bg-white border-orange-200" />
                                        </FormField>
                                    )}

                                    {editablePendingUpdates.rate_per_session !== undefined && (
                                        <FormField label="سعر الجلسة المقترح (ج.م)" htmlFor="p-rate">
                                            <div className="relative">
                                                <Input id="p-rate" type="number" value={editablePendingUpdates.rate_per_session} onChange={e => handlePendingUpdateChange('rate_per_session', parseFloat(e.target.value))} className="bg-white border-orange-200 pl-12 font-bold text-lg text-primary" />
                                                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                                            </div>
                                            <p className="text-[10px] text-orange-600 mt-1">السعر الحالي المعتمد: {instructor.rate_per_session} ج.م</p>
                                        </FormField>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-gray-700 border-b pb-1">النبذة والفلسفة</h4>
                                    {editablePendingUpdates.bio !== undefined && (
                                        <FormField label="النبذة التعريفية المقترحة" htmlFor="p-bio">
                                            <Textarea id="p-bio" value={editablePendingUpdates.bio} onChange={e => handlePendingUpdateChange('bio', e.target.value)} rows={4} className="bg-white border-orange-200 text-sm" />
                                        </FormField>
                                    )}
                                    {editablePendingUpdates.teaching_philosophy !== undefined && (
                                        <FormField label="فلسفة التدريب المقترحة" htmlFor="p-philosophy">
                                            <Textarea id="p-philosophy" value={editablePendingUpdates.teaching_philosophy} onChange={e => handlePendingUpdateChange('teaching_philosophy', e.target.value)} rows={4} className="bg-white border-orange-200 text-sm" />
                                        </FormField>
                                    )}
                                </div>

                                <div className="col-span-full bg-orange-100/50 p-4 rounded-lg border border-orange-200">
                                    <h5 className="font-bold text-orange-800 mb-1 flex items-center gap-2"><Edit3 size={14}/> مبرر المدرب للطلب:</h5>
                                    <p className="text-sm text-orange-900 italic">"{instructor.pending_profile_data?.justification || 'لا يوجد مبرر مكتوب'}"</p>
                                </div>

                                <div className="col-span-full flex gap-4 pt-4 border-t border-orange-200">
                                    <Button variant="success" className="flex-1 h-12 text-lg shadow-md" onClick={handleApproveWithEdits} loading={approveInstructorProfileUpdate.isPending} icon={<Check />}>حفظ التعديلات واعتماد الطلب</Button>
                                    <Button variant="destructive" className="w-1/4 h-12" onClick={() => rejectInstructorProfileUpdate.mutate({instructorId: instructor.id})} loading={rejectInstructorProfileUpdate.isPending} icon={<XCircle />}>رفض الطلب بالكامل</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {instructor.schedule_status === 'pending' && (
                         <Card className="border-2 border-blue-400 shadow-lg bg-blue-50/10">
                            <CardHeader className="bg-blue-400/10 border-b border-blue-200">
                                <CardTitle className="flex items-center gap-2 text-blue-700 font-black"><Clock /> مراجعة تحديث الجدول الأسبوعي</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    {Object.entries((instructor.pending_profile_data?.proposed_schedule as WeeklySchedule) || {}).map(([day, times]) => (
                                        <div key={day} className="flex justify-between border-b border-blue-100 pb-1 text-sm">
                                            <span className="font-bold text-gray-700">{dayNames[day]}</span>
                                            <span className="text-blue-700 font-mono font-bold bg-blue-100/50 px-2 rounded">
                                                {Array.isArray(times) ? times.join(' | ') : '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
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
                <CardHeader><CardTitle className="flex items-center gap-2"><User /> البيانات الأساسية الحالية (المنشورة)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <form id="main-profile-form" onSubmit={handleSubmit} className="space-y-6">
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
                            <Input id="slug" name="slug" value={profile.slug} onChange={handleProfileChange} required dir="ltr" />
                        </FormField>
                        <FormField label="نبذة تعريفية" htmlFor="bio">
                            <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={5} />
                        </FormField>
                        
                        <div className="flex justify-end pt-4 border-t">
                            {!isNew && (
                                <Button type="submit" loading={isSaving} icon={<Save />}>
                                    تحديث البيانات المنشورة فوراً
                                </Button>
                            )}
                             {isNew && (
                                <Button type="submit" loading={isSaving} icon={<Save />}>
                                    إضافة مدرب
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminInstructorDetailPage;
