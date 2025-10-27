import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';

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
        <div className="bg-gray-50 py-12 sm:py-16 min-h-[70vh]">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-8 flex items-center justify-center gap-3">
                        <ShoppingCart size={32} />
                        سلة التسوق
                    </h1>

                    {cart.length > 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border">
                            <div className="space-y-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                        <span className="text-3xl">{getItemIcon(item.type)}</span>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-800">{item.payload.summary}</p>
                                            <p className="text-sm text-gray-500">{item.payload.total || item.payload.totalPrice} ج.م</p>
                                        </div>
                                        <button onClick={() => removeItemFromCart(item.id)} aria-label={`إزالة ${item.payload.summary}`} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>الإجمالي</span>
                                    <span>{cartTotal} ج.م</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">سيتم إضافة تكاليف الشحن في الخطوة التالية إن وجدت.</p>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    <CreditCard size={20} />
                                    <span>الانتقال إلى الدفع</span>
                                </button>
                                <Link
                                    to="/"
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-600 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors border"
                                >
                                    <ArrowLeft size={20} className="transform rotate-180" />
                                    <span>متابعة التسوق</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
                            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                            <h2 className="mt-4 text-2xl font-bold text-gray-800">سلتك فارغة</h2>
                            <p className="mt-2 text-gray-600">يبدو أنك لم تقم بإضافة أي منتجات بعد. ابدأ رحلتك الآن!</p>
                            <div className="mt-8">
                                <Link to="/" className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
                                    العودة إلى الرئيسية
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;