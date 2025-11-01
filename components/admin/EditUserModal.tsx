import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import type { UserProfile as User, UserRole } from '../../contexts/AuthContext.tsx';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { roleNames } from '../../lib/roles';
import { Select } from '../ui/Select';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    user: User | null;
    isSaving: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user, isSaving }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('user');

    const isEditMode = !!user;
    const canChangeRole = currentUser?.role === 'super_admin';

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = isEditMode
            ? { id: user.id, name, role }
            : { name, email, password, role };
        onSave(payload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
            footer={
                 <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                    <Button type="submit" form="edit-user-form" loading={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
            <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
                <FormField label="الاسم*" htmlFor="name">
                    <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </FormField>
                <FormField label="البريد الإلكتروني*" htmlFor="email">
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isEditMode} />
                </FormField>
                {canChangeRole && (
                    <FormField label="الدور" htmlFor="role">
                        <Select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} disabled={user?.id === currentUser?.id}>
                             {Object.entries(roleNames).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </Select>
                         {user?.id === currentUser?.id && <p className="text-xs text-muted-foreground mt-1">لا يمكنك تغيير دور حسابك.</p>}
                    </FormField>
                )}
                {!isEditMode && (
                    <FormField label="كلمة المرور*" htmlFor="password">
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span>سيتم إرسال بريد إلكتروني للمستخدم الجديد لتأكيد حسابه.</span>
                        </div>
                    </FormField>
                )}
            </form>
        </Modal>
    );
};

export default EditUserModal;