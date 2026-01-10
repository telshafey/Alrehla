
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { supportedCountries } from '../../data/mockData';
import { AlertCircle, Globe, LogOut } from 'lucide-react';
import { STAFF_ROLES } from '../../lib/roles';

const ProfileCompletionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. All Hooks must be called unconditionally at the top level
    const { currentUser, loading, updateCurrentUser, signOut } = useAuth();
    const { updateUser } = useUserMutations();
    const { addToast } = useToast();
    const location = useLocation();
    
    const [isOpen, setIsOpen] = useState(false);
    const [country, setCountry] = useState('EG');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 2. useEffect logic (moved before any returns)
    useEffect(() => {
        // If on admin route, ensure modal is closed
        if (location.pathname.startsWith('/admin')) {
            setIsOpen(false);
            return;
        }

        if (!loading && currentUser) {
            // Staff AND Students don't need profile completion checks here
            // Staff have their own admin area, and Students inherit context from parents
            if (STAFF_ROLES.includes(currentUser.role) || currentUser.role === 'student') {
                setIsOpen(false);
                return;
            }

            // Check if profile is complete for regular users (Parents/Customers)
            const isComplete = currentUser.country && currentUser.city && currentUser.phone;
            setIsOpen(!isComplete);
        }
    }, [loading, currentUser, location.pathname]);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
        window.location.href = '/';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        setIsSaving(true);
        try {
            const selectedCountryData = supportedCountries.find(c => c.code === country);
            
            const payload = {
                id: currentUser.id,
                country: selectedCountryData?.name || 'مصر',
                timezone: selectedCountryData?.timezone || 'Africa/Cairo',
                currency: selectedCountryData?.currency || 'EGP',
                city,
                phone,
                address: city, // Fallback
                governorate: city // Fallback
            };

            await updateUser.mutateAsync(payload);
            
            updateCurrentUser({
                country: selectedCountryData?.name || 'مصر',
                city,
                phone,
                timezone: selectedCountryData?.timezone,
                currency: selectedCountryData?.currency
            });
            
            setIsOpen(false);
            addToast('تم تحديث البيانات بنجاح', 'success');
        } catch (error: any) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Conditional Rendering

    // If loading, we can return null (though often better to show a spinner, null is fine here)
    if (loading) return null;

    // Admin routes bypass the guard entirely visually
    if (location.pathname.startsWith('/admin')) {
        return <>{children}</>;
    }

    // Staff bypass the guard
    if (currentUser && STAFF_ROLES.includes(currentUser.role)) {
        return <>{children}</>;
    }
    
    // Students bypass the guard
    if (currentUser && currentUser.role === 'student') {
        return <>{children}</>;
    }

    // If open, show modal
    if (isOpen) {
        return (
            <Modal
                isOpen={true}
                onClose={() => {}} // Prevent closing by clicking outside
                title="استكمال البيانات الأساسية"
                size="md"
                footer={
                     <div className="w-full flex justify-between items-center gap-4">
                        <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            onClick={handleSignOut} 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
                        >
                            <LogOut size={16} /> تسجيل الخروج
                        </Button>
                         <Button type="submit" form="completion-form" loading={isSaving} size="default">
                            حفظ ومتابعة
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                        <Globe className="shrink-0 mt-0.5" size={18} />
                        <p>
                            لضمان أفضل تجربة وضبط توقيت الجلسات وعرض الأسعار بما يناسبك، يرجى تحديد موقعك الجغرافي.
                        </p>
                    </div>

                    <form id="completion-form" onSubmit={handleSubmit} className="space-y-4">
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
                    </form>
                </div>
            </Modal>
        );
    }

    return <>{children}</>;
};

export default ProfileCompletionGuard;
