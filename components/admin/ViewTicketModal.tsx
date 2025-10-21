import React from 'react';
import type { SupportTicket } from '../../lib/database.types.ts';

const ViewTicketModal: React.FC<{
    ticket: SupportTicket | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ ticket, isOpen, onClose }) => {
    if (!isOpen || !ticket) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الرسالة</h3>
                 <div className="space-y-4 text-sm">
                    <p><span className="font-semibold text-gray-500">من:</span> {ticket.name} ({ticket.email})</p>
                    <p><span className="font-semibold text-gray-500">الموضوع:</span> {ticket.subject}</p>
                    <div className="p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                 </div>
                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">إغلاق</button>
                 </div>
            </div>
        </div>
    );
};

export default ViewTicketModal;