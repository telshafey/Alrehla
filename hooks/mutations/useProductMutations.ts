
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { orderService } from '../../services/orderService';

export const useProductMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createPersonalizedProduct = useMutation({
        mutationFn: orderService.createPersonalizedProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم إنشاء المنتج بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إنشاء المنتج: ${err.message}`, 'error'),
    });
    
    const updatePersonalizedProduct = useMutation({
        mutationFn: orderService.updatePersonalizedProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم تحديث المنتج بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث المنتج: ${err.message}`, 'error'),
    });

    const deletePersonalizedProduct = useMutation({
        mutationFn: (payload: { productId: number }) => orderService.deletePersonalizedProduct(payload.productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم حذف المنتج بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف المنتج: ${err.message}`, 'error'),
    });

    return { createPersonalizedProduct, updatePersonalizedProduct, deletePersonalizedProduct };
}
