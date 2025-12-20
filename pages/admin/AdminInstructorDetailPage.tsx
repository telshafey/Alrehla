
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
import { ArrowLeft, Save, User, AlertCircle, Check, XCircle, FileEdit, Calendar, Clock, Book, Trash2, Star } from 'lucide-react';
import type { Instructor, WeeklySchedule, AvailableSlots } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Image from '../../components/ui/Image';
import { formatDate } from '../../utils/helpers';

const dayNames: { [key: string]: string } = {
    saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء',
    thursday: 'الخميس', friday: 'الجمعة'
};

const allDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour}:${min}`;
});

const ValueFormatter: React.FC<{ value: any }> = ({ value }) => {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">فارغ</span>;
    if (Array.isArray(value)) {
        return (
            <ul className="space-y-1">
                {value.map((v, i) => (
                    <li key={i} className="border-b last:border-0 pb-1 flex items-center gap-2">
                        {typeof v === 'object' ? <span className="flex items-center gap-2"><Book size={12} /> {v.title || 'بدون عنوان'}</span> : v.toString()}
                    </li>
                ))}
            </ul>
        );
    }
    if (typeof value === 'object') return <pre className="text-[10px]">{JSON.stringify(value, null, 2)}</pre>;
    return <span>{value.toString()}</span>;
};

const ChangeEditor: React.FC<{ label: string, oldValue: any, newValue: any, onEdit: (val: any) => void }> = ({ label, oldValue, newValue, onEdit }) => {
    const isPrice = label.includes('سعر') || label.includes('Rate');
    return (
        <div className="bg-white p-3 rounded border mb-2 shadow-sm">
            <strong className="block text-sm font-semibold text-gray-700 mb-2">{label}:</strong>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-2 bg-red-50 text-red-700 rounded text-xs border border-red-100 opacity-60">
                    <span className="block font-bold mb-1">الحالي:</span>
                    <ValueFormatter value={oldValue} />
                </div>
                <div className="p-2 bg-green-50 text-green-700 rounded text-xs border border-green-200">
                    <span className="block font-bold mb-1 text-green-800">تعديل الإدارة:</span>
                    {typeof newValue === 'string' && newValue.length > 50 ? (
                        <Textarea className="text-xs bg-white mt-1" value={newValue} onChange={e => onEdit(e.target.value)} />
                    ) : Array.isArray(newValue) ? (
                        <div className="bg-white/50 p-2 rounded"><ValueFormatter value={newValue} /></div>
                    ) : (
                        <Input type={isPrice ? 'number' : 'text'} className="text-xs h-8 bg-white mt-1" value={newValue} onChange={e => onEdit(e.target.value)} />
                    )}
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
    const { data: settingsData, isLoading: settingsLoading } = useAdminCWSettings();
    const { 
        createInstructor, updateInstructor, approveInstructorProfileUpdate, 
        rejectInstructorProfileUpdate, approveInstructorSchedule, rejectInstructorSchedule,
        approveIntroAvailability 
    } = useInstructorMutations();
    
    const [profile, setProfile] = useState<Partial<Instructor>>({ name: '', specialty: '', slug: '', bio: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Edited states for approval workflow
    const [editedUpdates, setEditedUpdates] = useState<any>(null);
    const [editedSchedule, setEditedSchedule] = useState<WeeklySchedule | null>(null);
    const [editedIntroAvail, setEditedIntroAvail] = useState<AvailableSlots | null>(null);

    const instructor = !isNew ? instructors.find(i => i.id === parseInt(id!)) : null;

    useEffect(() => {
        if (instructor) {
            setProfile(instructor);
            setPreview(instructor.avatar_url || null);
            if (instructor.profile_update_status === 'pending') {
                setEditedUpdates(JSON.parse(JSON.stringify(instructor.pending_profile_data?.updates || {})));
            }
            if (instructor.schedule_status === 'pending') {
                setEditedSchedule(JSON.parse(JSON.stringify(instructor.pending_profile_data?.proposed_schedule || {})));
            }
            if (instructor.pending_profile_data?.proposed_intro_availability) {
                setEditedIntroAvail(JSON.parse(JSON.stringify(instructor.pending_profile_data.proposed_intro_availability)));
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
        if (file) setPreview(URL.createObjectURL(file));
        else setPreview(instructor?.avatar_url || null);
    };
    
    const toggleScheduleTime = (day: string, time: string) => {
        if (!editedSchedule) return;
        setEditedSchedule(prev => {
            const daySlots = prev![day] || [];
            const newSlots = daySlots.includes(time) ? daySlots.filter(t => t !== time) : [...daySlots, time].sort();
            return { ...prev, [day]: newSlots };
        });
    };

    const removeIntroTime = (date: string, time: string) => {
        if (!editedIntroAvail) return;
        setEditedIntroAvail(prev => {
            const newDay = (prev![date] as string[]).filter(t => t !== time);
            const newState = { ...prev };
            if (newDay.length === 0) delete newState[date];
            else newState[date] = newDay;
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) await createInstructor.mutateAsync({ ...profile, avatarFile });
        else await updateInstructor.mutateAsync({ ...profile, avatarFile });
        navigate('/admin/instructors');
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
                <Button type="submit" form="main-profile-form" loading={isSaving} icon={<Save />}>تحديث مباشر</Button>
            </div>
            
            {!isNew && instructor && (
                <div className="grid grid-cols-1 gap-8">
                    {/* 1. Profile Updates Review */}
                    {instructor.profile_update_status === 'pending' && (
                        <Card className="border-2 border-orange-400 shadow-lg bg-orange-50/10">
                            <CardHeader className="bg-orange-400/10 border-b border-orange-200">
                                <CardTitle className="flex items-center gap-2 text-orange-700"><FileEdit /> مراجعة البيانات والأسعار</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {editedUpdates && Object.keys(editedUpdates).map(key => {
                                    const labelMap: any = { rate_per_session: 'سعر الجلسة', bio: 'النبذة', specialty: 'التخصص', teaching_philosophy: 'الفلسفة', expertise_areas: 'الخبرات', service_rates: 'أسعار الخدمات', package_rates: 'أسعار الباقات' };
                                    if (key === 'service_rates' || key === 'package_rates') {
                                         return Object.keys(editedUpdates[key]).map(itemId => {
                                            const items = key === 'service_rates' ? settingsData?.standaloneServices : settingsData?.packages;
                                            const itemName = (items as any[])?.find(item => item.id == itemId)?.name || `ID: ${itemId}`;
                                            return <ChangeEditor key={`${key}-${itemId}`} label={`سعر: ${itemName}`} oldValue={(instructor as any)[key]?.[itemId]} newValue={editedUpdates[key][itemId]} onEdit={v => setEditedUpdates({...editedUpdates, [key]: {...editedUpdates[key], [itemId]: v}})} />
                                        });
                                    }
                                    return <ChangeEditor key={key} label={labelMap[key] || key} oldValue={(instructor as any)[key]} newValue={editedUpdates[key]} onEdit={v => setEditedUpdates({...editedUpdates, [key]: v})} />
                                })}
                                <div className="flex gap-3 mt-6">
                                    <Button variant="success" className="flex-1" onClick={() => approveInstructorProfileUpdate.mutate({instructorId: instructor.id, modifiedUpdates: editedUpdates})} loading={approveInstructorProfileUpdate.isPending} icon={<Check />}>اعتماد التعديلات</Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => rejectInstructorProfileUpdate.mutate({instructorId: instructor.id})} loading={rejectInstructorProfileUpdate.isPending} icon={<XCircle />}>رفض</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 2. Weekly Schedule Review */}
                    {instructor.schedule_status === 'pending' && (
                         <Card className="border-2 border-blue-400 shadow-lg bg-blue-50/10">
                            <CardHeader className="bg-blue-400/10 border-b border-blue-200">
                                <CardTitle className="flex items-center gap-2 text-blue-700"><Clock /> مراجعة الجدول الأسبوعي</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {allDays.map(day => (
                                        <div key={day} className="p-3 bg-white border rounded-lg">
                                            <h5 className="font-bold text-sm mb-3 border-b pb-1">{dayNames[day]}</h5>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1">
                                                {timeSlots.map(time => {
                                                    const isSelected = editedSchedule?.[day]?.includes(time);
                                                    return <button key={time} type="button" onClick={() => toggleScheduleTime(day, time)} className={`p-1 text-[10px] border rounded transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-blue-50'}`}>{time}</button>
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="success" className="flex-1" onClick={() => approveInstructorSchedule.mutate({instructorId: instructor.id, modifiedSchedule: editedSchedule!})} loading={approveInstructorSchedule.isPending} icon={<Check />}>اعتماد الجدول المعدل</Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => rejectInstructorSchedule.mutate({instructorId: instructor.id})} loading={rejectInstructorSchedule.isPending} icon={<XCircle />}>رفض</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 3. Intro Availability Review */}
                    {editedIntroAvail && (
                        <Card className="border-2 border-green-400 shadow-lg bg-green-50/10">
                            <CardHeader className="bg-green-400/10 border-b border-green-200">
                                <CardTitle className="flex items-center gap-2 text-green-700"><Star className="text-yellow-500" /> مراجعة المواعيد التعريفية</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {Object.entries(editedIntroAvail).map(([date, times]) => (
                                        <div key={date} className="p-3 bg-white border rounded-lg">
                                            <p className="font-bold text-sm mb-2">{date}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(times as string[]).map(time => (
                                                    <span key={time} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                        {time}
                                                        <button onClick={() => removeIntroTime(date, time)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="success" className="flex-1" onClick={() => approveIntroAvailability.mutate({instructorId: instructor.id, modifiedAvailability: editedIntroAvail})} loading={approveIntroAvailability.isPending} icon={<Check />}>اعتماد هذه المواعيد</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <Card>
                <CardHeader><CardTitle>البيانات الأساسية الحالية</CardTitle></CardHeader>
                <CardContent>
                    <form id="main-profile-form" onSubmit={handleSubmit} className="space-y-6">
                        <FormField label="الصورة الرمزية" htmlFor="avatarFile">
                            <div className="flex items-center gap-4">
                                <Image src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full border shadow-sm" />
                                <Input type="file" id="avatarFile" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="اسم المدرب" htmlFor="name">
                                <Input id="name" name="name" value={profile.name} onChange={v => setProfile({...profile, name: v.target.value})} required />
                            </FormField>
                            <FormField label="التخصص" htmlFor="specialty">
                                <Input id="specialty" name="specialty" value={profile.specialty} onChange={v => setProfile({...profile, specialty: v.target.value})} />
                            </FormField>
                        </div>
                        <FormField label="معرّف الرابط (Slug)" htmlFor="slug">
                            <Input id="slug" name="slug" value={profile.slug} onChange={v => setProfile({...profile, slug: v.target.value})} required dir="ltr" />
                        </FormField>
                        <FormField label="نبذة تعريفية" htmlFor="bio">
                            <Textarea id="bio" name="bio" value={profile.bio} onChange={v => setProfile({...profile, bio: v.target.value})} rows={5} />
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
