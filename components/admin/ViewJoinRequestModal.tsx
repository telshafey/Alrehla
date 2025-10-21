import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import type { JoinRequest } from '../../lib/database.types.ts';

const ViewJoinRequestModal: React.FC<{
    request: JoinRequest | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ request, isOpen, onClose }) => {
    if (!isOpen || !request) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الطلب</h3>
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
                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">إغلاق</button>
                 </div>
            </div>
        </div>
    );
};

export default ViewJoinRequestModal;