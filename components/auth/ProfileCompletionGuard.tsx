
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { supportedCountries } from '../../data/mockData';
import { AlertCircle, Globe } from 'lucide-react';
import { STAFF_ROLES } from '../../lib/roles';

const ProfileCompletionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading, updateCurrentUser } = useAuth();
    const { updateUser } = useUserMutations();
    const [isOpen, setIsOpen] = useState(false);
    const [country, setCountry] = useState('EG'); // Default
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Check if profile is complete
    useEffect(() => {
        if (!loading && currentUser) {
            // استثناء فريق العمل من التحقق الإجباري
            if (STAFF_ROLES.includes(currentUser.role)) {
                setIsOpen(false);
                return;
            }

            const isComplete = currentUser.country && currentUser.city && currentUser.phone;
            setIsOpen(!isComplete);
        }
    }, [loading, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        setIsSaving(true);
        try {
            const selectedCountryData = supportedCountries.find(c => c.code === country);
            
            await updateUser.mutateAsync({
                id: currentUser.id,
                country: selectedCountryData?.name || 'مصر',
                timezone: selectedCountryData?.timezone || 'Africa/Cairo',
                currency: selectedCountryData?.currency || 'EGP',
                city,
                phone,
                // Map city to governorate/address for backward compatibility if needed
                address: city, 
                governorate: city
            });
            
            // Local update to close modal immediately
            updateCurrentUser({
                country: selectedCountryData?.name || 'مصر',
                city,
                phone,
                timezone: selectedCountryData?.timezone,
                currency: selectedCountryData?.currency
            });
            
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return null;

    if (isOpen) {
        return (
            <Modal
                isOpen={true}
                onClose={() => {}} // Cannot close without saving
                title="استكمال البيانات الأساسية"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                        <Globe className="shrink-0 mt-0.5" size={18} />
                        <p>
                            لضمان أفضل تجربة وضبط توقيت الجلسات وعرض الأسعار بما يناسبك، يرجى تحديد موقعك الجغرافي.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="الدولة" htmlFor="country">
                            <Select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required>
                                {supportedCountries.map(c => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.label})</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="المدينة / المنطقة" htmlFor="city">
                            <Input 
                                id="city" 
                                value={city} 
                                onChange={(e) => setCity(e.target.value)} 
                                placeholder="مثال: الرياض، القاهرة، دبي" 
                                required 
                            />
                        </FormField>

                        <FormField label="رقم الهاتف" htmlFor="phone">
                            <Input 
                                id="phone" 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="لتأكيد الحجوزات" 
                                required 
                            />
                        </FormField>

                        <Button type="submit" loading={isSaving} className="w-full mt-4" size="lg">
                            حفظ ومتابعة
                        </Button>
                    </form>
                </div>
            </Modal>
        );
    }

    return <>{children}</>;
};

export default ProfileCompletionGuard;
