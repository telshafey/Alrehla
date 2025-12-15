
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { gamificationService } from '../../services/gamificationService';

export const useGamificationMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const awardBadge = useMutation({
        mutationFn: gamificationService.awardBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentDashboardData'] });
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            addToast('تم منح الشارة للطالب بنجاح! 🏆', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل منح الشارة: ${err.message}`, 'error');
        }
    });

    return { awardBadge };
};
