import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Link as LinkIcon, Link2Off } from 'lucide-react';
import { useAdminAllChildProfiles } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { useToast } from '../../contexts/ToastContext';
import type { UserProfile as User } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';

const LinkStudentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}> = ({ isOpen, onClose, user }) => {
    const { data: allChildProfiles = [] } = useAdminAllChildProfiles();
    const { linkStudentToChildProfile, unlinkStudentFromChildProfile } = useUserMutations();
    const { addToast } = useToast();

    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const isSaving = linkStudentToChildProfile.isPending || unlinkStudentFromChildProfile.isPending;

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

    if (!user) return null;

    const handleSave = async () => {
        if (!selectedChildId) {
            addToast('يرجى اختيار طفل لربطه بهذا الحساب.', 'warning');
            return;
        }
        try {
            await linkStudentToChildProfile.mutateAsync({ studentUserId: user.id, childProfileId: parseInt(selectedChildId, 10) });
            onClose();
        } catch (error) {
            // Toast is handled in context
        }
    };
    
    const handleUnlink = async () => {
        if (!linkedChild) return;
        try {
            await unlinkStudentFromChildProfile.mutateAsync({childProfileId: linkedChild.id});
            onClose();
        } catch(error) {
             // Toast is handled in context
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="ربط حساب الطالب"
            footer={
                <div className="flex justify-between items-center w-full">
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
                        className="ml-auto"
                    >
                       {linkedChild ? 'تغيير الربط' : 'ربط الحساب'}
                    </Button>
                </div>
            }
        >
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
        </Modal>
    );
};

export default LinkStudentModal;