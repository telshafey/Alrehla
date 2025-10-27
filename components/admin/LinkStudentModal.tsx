
import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Link as LinkIcon, Link2Off } from 'lucide-react';
import { useAdminAllChildProfiles } from '../../hooks/adminQueries';
import { useUserMutations } from '../../hooks/mutations';
import { useToast } from '../../contexts/ToastContext';
import type { UserProfile as User } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import FormField from '../ui/FormField';

const LinkStudentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}> = ({ isOpen, onClose, user }) => {
    const { data: allChildProfiles = [] } = useAdminAllChildProfiles();
    const { linkStudentToChildProfile, unlinkStudentFromChildProfile } = useUserMutations();
    const { addToast } = useToast();

    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const linkedChild = useMemo(() => {
        if (!user) return null;
        return allChildProfiles.find(c => c.student_user_id === user.id) || null;
    }, [user, allChildProfiles]);

    const unlinkedChildren = useMemo(() => {
        return allChildProfiles.filter(c => !c.student_user_id || c.student_user_id === user?.id);
    }, [allChildProfiles, user]);

    useEffect(() => {
        if (isOpen) {
            setSelectedChildId(linkedChild?.id.toString() || '');
        }
    }, [isOpen, linkedChild]);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        if (!selectedChildId) {
            addToast('يرجى اختيار طفل لربطه بهذا الحساب.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            await linkStudentToChildProfile.mutateAsync({ studentUserId: user.id, childProfileId: parseInt(selectedChildId, 10) });
            onClose();
        } catch (error) {
            // Toast is handled in context
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleUnlink = async () => {
        if (!linkedChild) return;
        setIsSaving(true);
        try {
            await unlinkStudentFromChildProfile.mutateAsync({childProfileId: linkedChild.id});
            onClose();
        } catch(error) {
             // Toast is handled in context
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">ربط حساب الطالب</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </Button>
                </div>
                <p className="text-gray-600 mb-6">
                    اختر ملف الطفل الذي تريد ربطه بحساب الطالب <span className="font-bold">{user.name}</span>.
                </p>

                <div className="space-y-4">
                    <FormField label="ملفات الأطفال المتاحة" htmlFor="child-select">
                        <Select
                            id="child-select"
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                        >
                            <option value="">-- اختر طفلاً --</option>
                            {unlinkedChildren.map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                        </Select>
                         {unlinkedChildren.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2">لا توجد ملفات أطفال غير مرتبطة حاليًا.</p>
                         )}
                    </FormField>
                </div>

                <div className="flex justify-between items-center gap-4 pt-6 mt-8 border-t">
                    {linkedChild && (
                        <Button
                            onClick={handleUnlink}
                            loading={isSaving}
                            variant="subtle"
                            className="text-red-700 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"
                            icon={<Link2Off size={16} />}
                        >
                           إلغاء الربط
                        </Button>
                    )}
                    <Button 
                        onClick={handleSave}
                        loading={isSaving}
                        disabled={isSaving || !selectedChildId} 
                        icon={<LinkIcon size={16} />}
                    >
                       {linkedChild ? 'تغيير الربط' : 'ربط الحساب'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LinkStudentModal;