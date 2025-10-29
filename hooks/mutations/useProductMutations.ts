import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useProductMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createPersonalizedProduct = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(800);
            console.log("Creating product (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم إنشاء المنتج بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إنشاء المنتج: ${err.message}`, 'error'),
    });
    
    const updatePersonalizedProduct = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(800);
            console.log("Updating product (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم تحديث المنتج بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث المنتج: ${err.message}`, 'error'),
    });

    const deletePersonalizedProduct = useMutation({
        mutationFn: async ({ productId }: { productId: number }) => {
            await sleep(500);
            console.log("Deleting product (mock)", productId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم حذف المنتج بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف المنتج: ${err.message}`, 'error'),
    });

    return { createPersonalizedProduct, updatePersonalizedProduct, deletePersonalizedProduct };
}
