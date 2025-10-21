import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { ChildProfile } from '../../lib/database.types.ts';

interface ChildCardProps {
    child: ChildProfile;
    onEdit: (child: ChildProfile) => void;
    onDelete: (childId: number) => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-md border flex flex-col sm:flex-row items-center gap-4">
            <img 
                src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                alt={child.name} 
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
            />
            <div className="flex-grow text-center sm:text-right">
                <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
                <p className="text-gray-500">{child.age} سنوات</p>
            </div>
            <div className="flex-shrink-0 flex gap-2">
                <button onClick={() => onEdit(child)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full">
                    <Edit size={18} />
                </button>
                <button onClick={() => onDelete(child.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChildCard;
