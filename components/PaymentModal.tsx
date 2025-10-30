import React, { useState, useEffect } from 'react';
import { Loader2, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useOrderMutations } from '../hooks/mutations/useOrderMutations';
import { useToast } from '../contexts/ToastContext';
import Modal from './ui/Modal';
import ReceiptUpload from './shared/ReceiptUpload';
import { Button } from './ui/Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: { id: string; type: 'order' | 'booking' | 'subscription' } | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
  const { updateReceipt } = useOrderMutations();
  const { addToast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const isSubmitting = updateReceipt.isPending;

  useEffect(() => {
    if (isOpen) {
        setReceiptFile(null);
    }
  }, [isOpen]);

  if (!item) return null;

  const handleConfirmPayment = async () => {
    if (!receiptFile) {
        addToast('يرجى رفع إيصال الدفع أولاً.', 'warning');
        return;
    }
    
    try {
        await updateReceipt.mutateAsync({
            itemId: item.id,
            itemType: item.type,
            receiptFile
        });
        onSuccess();
    } catch (error: any) {
        // Error toast handled in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تأكيد الدفع"
      footer={
        <>
          <Button onClick={onClose} disabled={isSubmitting} variant="ghost">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={!receiptFile || isSubmitting}
            loading={isSubmitting}
            icon={isSubmitting ? undefined : <Upload size={18} />}
            variant="success"
            className="w-48"
          >
            {isSubmitting ? 'جاري الرفع...' : 'تأكيد ورفع الإيصال'}
          </Button>
        </>
      }
    >
      <p className="text-gray-600 mb-6 text-center">
        لإتمام طلبك رقم <span className="font-bold font-mono text-sm">{item.id}</span>، يرجى اتباع الخطوات التالية.
      </p>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg space-y-4">
        <p className="font-semibold text-gray-700">1. قم بالدفع عبر الرابط التالي:</p>
        <a href={'https://ipn.eg/S/gm2000/instapay/0dqErO'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors">
          <LinkIcon size={18} />
          <span>افتح رابط الدفع</span>
        </a>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <AlertCircle size={32} />
          <span>يرجى ملاحظة أن هذا الرابط سينقلك إلى موقع خارجي لإتمام عملية الدفع.</span>
        </div>
        <p className="font-semibold text-gray-700 mt-6">2. ارفع صورة إيصال الدفع هنا:</p>
        <ReceiptUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
      </div>
    </Modal>
  );
};

export default PaymentModal;