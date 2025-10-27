import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChildProfileSelectorProps {
    selectedChildId: string;
    setSelectedChildId: (id: string) => void;
}

const ChildProfileSelector: React.FC<ChildProfileSelectorProps> = ({ selectedChildId, setSelectedChildId }) => {
    const { childProfiles, currentUser } = useAuth();
    const isParent = currentUser?.role === 'parent';

    if (!isParent) {
        return null; // Don't show this for regular users
    }

    if (!childProfiles || childProfiles.length === 0) {
        return (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
                <p className="font-bold">لا يوجد أطفال في ملفك!</p>
                <p className="text-sm">يجب إضافة ملف طفل أولاً لتتمكن من إكمال الطلب.</p>
                <Link to="/account" state={{ defaultTab: 'family' }} className="mt-2 inline-block text-sm font-semibold text-yellow-900 underline">
                    اذهب للمركز العائلي لإضافة طفل
                </Link>
            </div>
        );
    }

    return (
        <div>
            <label htmlFor="child-selector" className="block text-sm font-bold text-gray-700 mb-2">
                اختر الطفل لهذا الطلب*
            </label>
            <div className="flex gap-2 items-center">
                <select
                    id="child-selector"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    required
                >
                    <option value="" disabled>-- اختر من ملفات أطفالك --</option>
                    {childProfiles.map(child => (
                        <option key={child.id} value={child.id.toString()}>
                            {child.name} ({child.age} سنوات)
                        </option>
                    ))}
                </select>
                <Link to="/account" state={{ defaultTab: 'family' }} className="flex-shrink-0 p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="إدارة ملفات الأطفال">
                    <Plus size={20} />
                </Link>
            </div>
        </div>
    );
};

export default ChildProfileSelector;