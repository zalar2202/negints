'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [cartCurrency, setCartCurrency] = useState('IRT');

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setCartCount(0);
            setCartCurrency('IRT');
            return;
        }


        setLoading(true);
        try {
            const { data } = await axios.get('/api/cart');
            if (data.success) {
                setCartItems(data.data.items || []);
                let currency = data.data.currency || 'IRT';
                if (currency === 'USD') currency = 'IRT'; 
                setCartCurrency(currency);
                const count = (data.data.items || []).reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    // Update cart count when adding items
    const refreshCart = () => {
        fetchCart();
    };

    const updateCurrency = async (currency) => {
        try {
            const { data } = await axios.get('/api/cart');
            if (data.success) {
                await axios.put('/api/cart', { currency });
                setCartCurrency(currency);
                refreshCart();
            }
        } catch (error) {
            console.error('Failed to update cart currency:', error);
        }
    };

    const value = {
        cartItems,
        cartCount,
        cartCurrency,
        loading,
        refreshCart,
        updateCurrency
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    // Added for recompile
    return context;
}
