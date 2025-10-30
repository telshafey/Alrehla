import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import type { JoinRequest } from '../../lib/database.types';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

const ViewJoinRequestModal: React.FC<{
    request: JoinRequest | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ request, isOpen, onClose }) => {
    if (!request) return null;
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="تفاصيل طلب الانضمام"
            footer={<Button onClick={onClose}>إغلاق</Button>}
        >
            <div className="space-y-4 text-sm">
                <p><span className="font-semibold text-gray-500">الاسم:</span> {request.name}</p>
                <p><span className="font-semibold text-gray-500">البريد الإلكتروني:</span> {request.email}</p>
                <p><span className="font-semibold text-gray-500">مهتم بالانضمام كـ:</span> {request.role}</p>
                {request.portfolio_url && (
                    <p className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500">معرض الأعمال:</span> 
                        <a href={request.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon size={14}/> <span>رابط</span>
                        </a>
                    </p>
                )}
                <div className="p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{request.message}</p>
                </div>
            </div>
        </Modal>
    );
};

export default ViewJoinRequestModal;