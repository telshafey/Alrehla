import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const CartPage: React.FC = () => {
    const { cart, removeItemFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();
    const cartTotal = getCartTotal();

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'order': return '🛍️';
            case 'booking': return '🗓️';
            case 'subscription': return '🎁';
            default: return '🛒';
        }
    };

    return (
        <div className="bg-muted/50 py-12 sm:py-16 min-h-[70vh] animate-fadeIn">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                     {cart.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <ShoppingCart />
                                    سلة التسوق
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                            <span className="text-3xl">{getItemIcon(item.type)}</span>
                                            <div className="flex-grow">
                                                <p className="font-bold text-foreground flex items-center gap-2">
                                                    {item.payload.formData?.shippingOption === 'gift' && <span title="هدية">🎁</span>}
                                                    {item.payload.summary}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{item.payload.total || item.payload.totalPrice} ج.م</p>
                                            </div>
                                            <Button onClick={() => removeItemFromCart(item.id)} variant="ghost" size="icon" aria-label={`إزالة ${item.payload.summary}`} className="text-destructive">
                                                <Trash2 size={20} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-stretch space-y-6">
                                <div>
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span>الإجمالي</span>
                                        <span>{cartTotal} ج.م</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">سيتم إضافة تكاليف الشحن في الخطوة التالية إن وجدت.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row-reverse gap-4">
                                     <Button onClick={() => navigate('/checkout')} className="w-full sm:w-auto" size="lg" icon={<CreditCard />}>
                                        الانتقال إلى الدفع
                                    </Button>
                                    <Button as={Link} to="/" variant="outline" className="w-full sm:w-auto" size="lg">
                                        <ArrowLeft size={20} className="transform rotate-180 ml-2" />
                                        <span>متابعة التسوق</span>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="text-center">
                            <CardContent className="pt-12 pb-12">
                                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                                <h2 className="mt-4 text-2xl font-bold text-foreground">سلتك فارغة</h2>
                                <p className="mt-2 text-muted-foreground">يبدو أنك لم تقم بإضافة أي منتجات بعد. ابدأ رحلتك الآن!</p>
                                <Button asChild className="mt-8">
                                    <Link to="/">العودة إلى الرئيسية</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;