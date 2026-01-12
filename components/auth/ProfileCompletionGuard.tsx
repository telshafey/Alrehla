
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
import { Globe, LogOut, SkipForward, CheckCircle2 } from 'lucide-react';
import { STAFF_ROLES } from '../../lib/roles';

const ProfileCompletionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { 
        currentUser, 
        loading, 
        updateCurrentUser, 
        signOut, 
        isProfileComplete,
        profileModalOpen,
        isProfileMandatory,
        triggerProfileUpdate,
        closeProfileModal
    } = useAuth();
    
    const { updateUser } = useUserMutations();
    const { addToast } = useToast();
    const location = useLocation();
    
    const [country, setCountry] = useState('EG');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial Check on Load
    useEffect(() => {
        // Skip for admin routes, staff, students, or if already loading/complete
        if (loading || !currentUser || location.pathname.startsWith('/admin') || 
            STAFF_ROLES.includes(currentUser.role) || currentUser.role === 'student' || 
            isProfileComplete) {
            return;
        }

        // Check if user has already skipped this session
        const hasSkipped = sessionStorage.getItem('profile_skipped');

        // Only trigger if not skipped, or if forced externally
        if (!hasSkipped && !profileModalOpen) {
            triggerProfileUpdate(false); // Default to Soft check (skippable)
        }
    }, [loading, currentUser, location.pathname, isProfileComplete]);

    // Update local state when modal opens
    useEffect(() => {
        if (profileModalOpen && currentUser) {
            setCountry(currentUser.country ? supportedCountries.find(c => c.name === currentUser.country)?.code || 'EG' : 'EG');
            setCity(currentUser.city || '');
            setPhone(currentUser.phone || '');
        }
    }, [profileModalOpen, currentUser]);

    const handleSignOut = async () => {
        await signOut();
        closeProfileModal();
        window.location.href = '/';
    };

    const handleSkip = () => {
        if (isProfileMandatory) return; // Cannot skip mandatory checks
        sessionStorage.setItem('profile_skipped', 'true');
        closeProfileModal();
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
            
            closeProfileModal();
            addToast('شكراً لك! تم تحديث بياناتك بنجاح.', 'success');
        } catch (error: any) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    // If modal is not open, just render children
    if (!profileModalOpen) return <>{children}</>;

    return (
        <>
            {children}
            <Modal
                isOpen={true}
                onClose={isProfileMandatory ? () => {} : handleSkip} // Only closeable if not mandatory
                title={isProfileMandatory ? "بيانات مطلوبة للمتابعة" : "أكمل ملفك الشخصي"}
                size="md"
                footer={
                     <div className="w-full flex justify-between items-center gap-4">
                         {!isProfileMandatory ? (
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={handleSkip} 
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <SkipForward size={16} className="mr-1" /> تخطي الآن
                            </Button>
                         ) : (
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={handleSignOut} 
                                className="text-red-500 hover:text-red-700"
                            >
                                <LogOut size={16} className="mr-1" /> خروج
                            </Button>
                         )}
                         
                         <Button type="submit" form="completion-form" loading={isSaving} size="default" icon={<CheckCircle2 />}>
                            حفظ ومتابعة
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className={`${isProfileMandatory ? 'bg-orange-50 text-orange-800' : 'bg-blue-50 text-blue-800'} p-4 rounded-lg flex gap-3 text-sm`}>
                        <Globe className="shrink-0 mt-0.5" size={18} />
                        <div>
                            {isProfileMandatory ? (
                                <p className="font-bold">نحتاج هذه البيانات لإتمام طلبك.</p>
                            ) : (
                                <p className="font-bold">مرحباً بك في الرحلة!</p>
                            )}
                            <p className="mt-1 opacity-90">
                                يساعدنا تحديد موقعك ورقم هاتفك في تقديم خدمة أفضل، وتسهيل التواصل عند توصيل الطلبات.
                            </p>
                        </div>
                    </div>

                    <form id="completion-form" onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="أين تقيم حالياً؟" htmlFor="country">
                            <Select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required autoFocus>
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
                                placeholder="اكتب اسم مدينتك..." 
                                required 
                            />
                        </FormField>

                        <FormField label="رقم الهاتف (للتواصل الهام فقط)" htmlFor="phone">
                            <Input 
                                id="phone" 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="01xxxxxxxxx" 
                                required 
                                dir="ltr"
                                className="text-left font-mono"
                            />
                        </FormField>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default ProfileCompletionGuard;
