
import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type CartItem = {
    id: string; // Unique ID for the cart item itself
    type: 'order' | 'booking' | 'subscription';
    payload: any;
    timestamp: number;
};

interface CartContextType {
    cart: CartItem[];
    addItemToCart: (item: Omit<CartItem, 'timestamp' | 'id'>) => void;
    removeItemFromCart: (itemId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const localData = sessionStorage.getItem('alrehlaCart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Could not parse cart from sessionStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            sessionStorage.setItem('alrehlaCart', JSON.stringify(cart));
        } catch (error) {
            console.error("Could not save cart to sessionStorage", error);
        }
    }, [cart]);

    const addItemToCart = useCallback((item: Omit<CartItem, 'timestamp' | 'id'>) => {
        const newItem: CartItem = { ...item, id: uuidv4(), timestamp: Date.now() };
        setCart(prevCart => [...prevCart, newItem]);
    }, []);
    
    const removeItemFromCart = useCallback((itemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        sessionStorage.removeItem('alrehlaCart');
    }, []);
    
    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => {
            const itemBase = item.payload.total || item.payload.totalPrice || 0;
            const shipping = item.payload.shippingPrice || 0;
            return total + itemBase + shipping;
        }, 0);
    }, [cart]);

    const value = useMemo(() => ({
        cart,
        addItemToCart,
        removeItemFromCart,
        clearCart,
        getCartTotal,
        itemCount: cart.length
    }), [cart, addItemToCart, removeItemFromCart, clearCart, getCartTotal]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
