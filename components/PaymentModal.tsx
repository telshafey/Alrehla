import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useAppMutations } from '../hooks/mutations.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { useModalAccessibility } from '../hooks/useModalAccessibility.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: { id: string; type: 'order' | 'booking' | 'subscription' } | null;
}

const FileUpload: React.FC<{ file: File | null; setFile: (file: File | null) => void; disabled?: boolean }> = ({ file, setFile, disabled }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${!disabled && 'hover:border-blue-400'}`}>
            <div className="space-y-1 text-center">
                {preview ? (
                     <img src={preview} alt="Preview" className="h-24 w-auto mx-auto rounded-md object-cover" />
                ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="receipt-file-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}>
                        <span>{file ? 'تغيير الملف' : 'اختر ملفًا'}</span>
                        <input id="receipt-file-upload" name="receipt-file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/*" required disabled={disabled} />
                    </label>
                    <p className="ps-1">{file ? file.name : 'أو اسحبه هنا'}</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
        </div>
    );
};


const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
  const { updateReceipt } = useAppMutations();
  const { addToast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

  useEffect(() => {
    if (isOpen) {
        setReceiptFile(null);
        setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleConfirmPayment = async () => {
    if (!receiptFile) {
        addToast('يرجى رفع إيصال الدفع أولاً.', 'warning');
        return;
    }
    
    setIsSubmitting(true);
    try {
        // Correctly call the mutation function using `.mutateAsync`.
        await updateReceipt.mutateAsync({
            itemId: item.id,
            itemType: item.type,
            receiptFile
        });
        onSuccess();
    } catch (error: any) {
        // Error toast handled in hook
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="payment-modal-title" className="text-2xl font-bold text-gray-800">تأكيد الدفع</h2>
          <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
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
                <AlertCircle size={32}/>
                <span>يرجى ملاحظة أن هذا الرابط سينقلك إلى موقع خارجي لإتمام عملية الدفع.</span>
            </div>
            <p className="font-semibold text-gray-700 mt-6">2. ارفع صورة إيصال الدفع هنا:</p>
            <FileUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
        </div>

        <div className="mt-8 flex justify-end gap-4">
            <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                إلغاء
            </button>
            <button 
                onClick={handleConfirmPayment} 
                disabled={!receiptFile || isSubmitting} 
                className="w-48 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                <span>{isSubmitting ? 'جاري الرفع...' : 'تأكيد ورفع الإيصال'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
