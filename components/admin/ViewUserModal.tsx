import React from 'react';
import { Mail, User, Shield } from 'lucide-react';
import type { UserProfileWithRelations } from '../../lib/database.types';
import { roleNames } from '../../lib/roles';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfileWithRelations | null;
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="text-foreground">{value}</p>
        </div>
    </div>
);

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="تفاصيل المستخدم"
            footer={<Button onClick={onClose}>إغلاق</Button>}
        >
            <div className="space-y-4">
                <DetailRow icon={<User size={18} />} label="الاسم" value={user.name} />
                <DetailRow icon={<Mail size={18} />} label="البريد الإلكتروني" value={user.email} />
                <DetailRow icon={<Shield size={18} />} label="الدور" value={roleNames[user.role]} />
                {user.children && user.children.length > 0 && (
                    <div>
                            <p className="text-sm font-semibold text-muted-foreground my-2">الأطفال المرتبطون:</p>
                            <div className="space-y-2">
                            {user.children.map(child => (
                                <div key={child.id} className="p-2 bg-muted rounded-md text-sm">{child.name} ({child.age} سنوات)</div>
                            ))}
                            </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ViewUserModal;