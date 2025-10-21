

import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Loader2, Link as LinkIcon, Link2Off } from 'lucide-react';
import { useAdminAllChildProfiles } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { UserProfile as User } from '../../contexts/AuthContext.tsx';

const LinkStudentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}> = ({ isOpen, onClose, user }) => {
    const { data: allChildProfiles = [] } = useAdminAllChildProfiles();
    const { linkStudentToChildProfile, unlinkStudentFromChildProfile } = useAppMutations();
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
            // Correctly call the mutation function using `.mutateAsync`.
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
            // Correctly call the mutation function using `.mutateAsync`.
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
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <p className="text-gray-600 mb-6">
                    اختر ملف الطفل الذي تريد ربطه بحساب الطالب <span className="font-bold">{user.name}</span>.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="child-select" className="block text-sm font-bold text-gray-700 mb-2">
                            ملفات الأطفال المتاحة
                        </label>
                        <select
                            id="child-select"
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">-- اختر طفلاً --</option>
                            {unlinkedChildren.map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                        </select>
                         {unlinkedChildren.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2">لا توجد ملفات أطفال غير مرتبطة حاليًا.</p>
                         )}
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4 pt-6 mt-8 border-t">
                    {linkedChild && (
                        <button 
                            onClick={handleUnlink}
                            disabled={isSaving} 
                            className="flex items-center gap-2 px-6 py-2 rounded-full text-red-700 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"
                        >
                           {isSaving ? <Loader2 className="animate-spin"/> : <Link2Off size={16} />}
                           <span>إلغاء الربط</span>
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !selectedChildId} 
                        className="flex items-center gap-2 px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                       {isSaving ? <Loader2 className="animate-spin"/> : <LinkIcon size={16} />}
                       <span>{linkedChild ? 'تغيير الربط' : 'ربط الحساب'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkStudentModal;
