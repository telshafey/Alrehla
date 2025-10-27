import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useProduct, Prices } from '../../contexts/ProductContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import FormField from '../../components/ui/FormField';

interface PriceInputProps {
    label: string;
    name: keyof Prices | `story.${'printed' | 'electronic'}`;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PriceInput: React.FC<PriceInputProps> = ({ label, name, value, onChange }) => (
    <FormField label={label} htmlFor={name as string}>
        <div className="relative">
            <Input 
                type="number" 
                id={name as string} 
                name={name as string} 
                value={value} 
                onChange={onChange} 
                className="pl-12 pr-4" 
                required
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">ج.م</span>
        </div>
    </FormField>
);

const AdminProductsPage: React.FC = () => {
    const { prices, setPrices, loading: isContextLoading } = useProduct();
    const [editablePrices, setEditablePrices] = useState<Prices | null>(prices);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (prices) {
            setEditablePrices(JSON.parse(JSON.stringify(prices)));
        }
    }, [prices]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? 0 : Number(value);

        setEditablePrices(prev => {
            if (!prev) return null;
            const [category, type] = name.split('.');

            if (type && category === 'story') {
                return {
                    ...prev,
                    story: {
                        ...prev.story,
                        [type]: numericValue,
                    },
                };
            } else {
                return {
                    ...prev,
                    [name]: numericValue,
                };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editablePrices) {
            addToast('لا يمكن حفظ الأسعار، البيانات غير متاحة.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await setPrices(editablePrices);
        } catch (error: any) {
             addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isContextLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>
    }
    
    if (!editablePrices) {
        return <div className="text-center text-red-500">فشلت تهيئة بيانات الأسعار. يرجى تحديث الصفحة.</div>
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">إدارة أسعار المنتجات</h1>
            <form onSubmit={handleSubmit}>
                <div className="bg-white p-8 rounded-2xl shadow-md space-y-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">القصص المخصصة</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <PriceInput label="القصة المطبوعة (+ إلكترونية)" name="story.printed" value={editablePrices.story.printed} onChange={handleChange} />
                            <PriceInput label="القصة الإلكترونية فقط" name="story.electronic" value={editablePrices.story.electronic} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">المنتجات الإضافية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                            <PriceInput label="دفتر التلوين" name="coloringBook" value={editablePrices.coloringBook} onChange={handleChange} />
                            <PriceInput label="كتيّب الأذكار والأدعية" name="duaBooklet" value={editablePrices.duaBooklet} onChange={handleChange} />
                            <PriceInput label="قصة الآداب والقيم" name="valuesStory" value={editablePrices.valuesStory} onChange={handleChange} />
                            <PriceInput label="قصة المهارات الحياتية" name="skillsStory" value={editablePrices.skillsStory} onChange={handleChange} />
                            <PriceInput label="التعليق الصوتي للقصة" name="voiceOver" value={editablePrices.voiceOver} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">الباقات</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                             <PriceInput label="بوكس الهدية (المجموعة الكاملة)" name="giftBox" value={editablePrices.giftBox} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">الاشتراكات</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                             <PriceInput label="صندوق الرحلة الشهري (السعر الشهري)" name="subscriptionBox" value={editablePrices.subscriptionBox} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end sticky bottom-6 mt-8">
                    <Button type="submit" loading={isSaving} size="lg" icon={<Save size={18} />} className="shadow-lg">
                        حفظ الأسعار
                    </Button>
                </div>
            </form>
        </div>
    );
};
export default AdminProductsPage;