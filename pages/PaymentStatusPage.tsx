
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/Button';

const PaymentStatusPage: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    
    const statusConfig = {
        success: {
            icon: <CheckCircle className="h-16 w-16 text-green-500" />,
            title: 'تم استلام طلبك بنجاح!',
            message: 'شكراً لطلبك. فريقنا سيبدأ في تجهيزه فوراً وسيتم إعلامك بالتحديثات.'
        },
        success_review: {
            icon: <Clock className="h-16 w-16 text-primary" />,
            title: 'تم رفع الإيصال بنجاح!',
            message: 'شكراً لك. طلبك الآن قيد المراجعة وسيتم تأكيده خلال 24 ساعة.'
        },
        cancelled: {
            icon: <AlertCircle className="h-16 w-16 text-destructive" />,
            title: 'تم إلغاء الطلب',
            message: 'تم إلغاء طلبك. إذا كان هذا خطأ، يرجى التواصل مع الدعم.'
        }
    };

    const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;

    return (
        <div className="flex items-center justify-center min-h-[70vh] bg-muted/50 p-4">
            <Card className="max-w-lg w-full text-center animate-fadeIn">
                <CardHeader>
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-muted mb-4">
                       {currentStatus.icon}
                    </div>
                    <CardTitle className="text-3xl">{currentStatus.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-base">{currentStatus.message}</CardDescription>
                    <Button as={Link} to="/account" className="mt-8">
                        الذهاب إلى حسابي
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentStatusPage;
