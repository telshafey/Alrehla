
import React, { useRef } from 'react';
import { X, Mail, User, Shield } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import type { UserProfileWithRelations } from '../../lib/database.types';
import { roleNames } from '../../lib/roles';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfileWithRelations | null;
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="flex-shrink-0 text-gray-500">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <p className="text-gray-800">{value}</p>
        </div>
    </div>
);

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="user-modal-title" className="text-2xl font-bold text-gray-800">تفاصيل المستخدم</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                    <DetailRow icon={<User size={18} />} label="الاسم" value={user.name} />
                    <DetailRow icon={<Mail size={18} />} label="البريد الإلكتروني" value={user.email} />
                    <DetailRow icon={<Shield size={18} />} label="الدور" value={roleNames[user.role]} />
                    {user.children && user.children.length > 0 && (
                        <div>
                             <p className="text-sm font-semibold text-gray-500 my-2">الأطفال المرتبطون:</p>
                             <div className="space-y-2">
                                {user.children.map(child => (
                                    <div key={child.id} className="p-2 bg-gray-100 rounded-md text-sm">{child.name} ({child.age} سنوات)</div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewUserModal;
