import React from 'react';
import type { SupportTicket } from '../../lib/database.types';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

const ViewTicketModal: React.FC<{
    ticket: SupportTicket | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ ticket, isOpen, onClose }) => {
    if (!ticket) return null;
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="تفاصيل الرسالة"
            footer={
                <Button onClick={onClose} variant="primary">
                    إغلاق
                </Button>
            }
        >
             <div className="space-y-4 text-sm">
                <p><span className="font-semibold text-gray-500">من:</span> {ticket.name} ({ticket.email})</p>
                <p><span className="font-semibold text-gray-500">الموضوع:</span> {ticket.subject}</p>
                <div className="p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{ticket.message}</p>
                </div>
             </div>
        </Modal>
    );
};

export default ViewTicketModal;
