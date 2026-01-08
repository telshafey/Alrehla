
import React, { useState } from 'react';
import { Save, CheckCircle, Star } from 'lucide-react';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import { useBookingMutations } from '../../../hooks/mutations/useBookingMutations';
import { useGamificationMutations } from '../../../hooks/mutations/useGamificationMutations';
import { usePublicData } from '../../../hooks/queries/public/usePublicDataQuery';
import { Select } from '../../ui/Select';

interface SessionReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
}

const SessionReportModal: React.FC<SessionReportModalProps> = ({ isOpen, onClose, session }) => {
    const { updateBookingProgressNotes } = useBookingMutations();
    const { awardBadge } = useGamificationMutations();
    const { data: publicData } = usePublicData();
    const [notes, setNotes] = useState('');
    const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. تحديث الملاحظات وإغلاق الجلسة
        await updateBookingProgressNotes.mutateAsync({
            bookingId: session.booking_id,
            notes: notes
        });

        // 2. منح شارة إذا تم اختيار واحدة
        if (selectedBadgeId) {
            await awardBadge.mutateAsync({
                childId: session.child_id,
                badgeId: parseInt(selectedBadgeId),
                instructorId: session.instructor_id
            });
        }

        onClose();
    };

    // Cast publicData to any to access potentially missing properties or extend the type
    const badges = (publicData as any)?.badges || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`تقرير الجلسة: ${session.child_name}`}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button onClick={handleSubmit} loading={updateBookingProgressNotes.isPending} icon={<CheckCircle />}>
                        حفظ وإتمام الجلسة
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs font-semibold">
                    هذا التقرير سيظهر لولي الأمر في لوحة التحكم الخاصة به لمتابعة تقدم طفله.
                </div>

                <FormField label="ملاحظات حول أداء الطالب" htmlFor="notes">
                    <Textarea 
                        id="notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="ما هي نقاط القوة التي أظهرها الطالب اليوم؟ وما الذي يحتاج للعمل عليه؟"
                        rows={5}
                        required
                    />
                </FormField>

                <div className="border-t pt-4">
                    <FormField label="منح شارة تشجيعية (اختياري)" htmlFor="badge">
                        <div className="flex items-center gap-3">
                            <Star className="text-yellow-500 shrink-0" />
                            <Select 
                                id="badge" 
                                value={selectedBadgeId} 
                                onChange={e => setSelectedBadgeId(e.target.value)}
                            >
                                <option value="">-- بدون شارة --</option>
                                {badges.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </Select>
                        </div>
                    </FormField>
                </div>
            </form>
        </Modal>
    );
};

export default SessionReportModal;
