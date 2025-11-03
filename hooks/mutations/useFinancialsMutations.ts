import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useFinancialsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createPayout = useMutation({
        mutationFn: async (payload: { instructorId: number, amount: number, details: string }) => {
            await sleep(500);
            console.log("Creating payout (mock)", payload);
            // In a real app, this would create a record in instructor_payouts table.
            return { success: true };
        },
        onSuccess: () => {
            // Invalidate the financials query to get the new payout reflected.
            queryClient.invalidateQueries({ queryKey: ['adminFinancials'] });
            addToast('تم تسجيل الدفعة بنجاح.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل تسجيل الدفعة: ${err.message}`, 'error');
        }
    });

    return { createPayout };
};
