"use client";
import React, { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CartCard } from '@/components/books/cart-item-card';
import { SectionHeader } from '@/components/books/section-header';
import { CartItem } from '@/lib/types';
import Link from 'next/link';

const Cart = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCartItems = async () => {
        try {
            const response = await fetch('/api/cart');
            if (!response.ok) throw new Error('Failed to fetch cart items');
            const data = await response.json();
            setCartItems(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            fetchCartItems();
        }
    }, [isSignedIn]);

    const handleQuantityChange = async (id: string, newQuantity: number) => {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, quantity: newQuantity })
            });

            if (!response.ok) throw new Error('Failed to update quantity');
            
            // Update local state after successful API call
            setCartItems(items => 
                items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
            );
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) throw new Error('Failed to remove item');
            
            // Update local state after successful API call
            setCartItems(items => items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    if (!isSignedIn) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh] flex flex-col items-center justify-center gap-4'>
                <h1 className='text-2xl font-bold'>Please Sign In</h1>
                <p className='text-gray-600 dark:text-gray-400'>You need to be signed in to view your cart.</p>
                <SignInButton mode="modal">
                    <Button variant="custom">Sign In</Button>
                </SignInButton>
            </div>
        );
    }

    if (!isLoaded || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <span className="inline-flex items-center">
                    Loading
                    <span className="ml-1 flex gap-1">
                        <span className="animate-[bounce_1s_infinite_0ms]">.</span>
                        <span className="animate-[bounce_1s_infinite_200ms]">.</span>
                        <span className="animate-[bounce_1s_infinite_400ms]">.</span>
                    </span>
                </span>
            </div>
        );
    }

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
        const buyingPrice = Math.floor(item.originalPrice - item.originalPrice * (item.discount / 100));
        return sum + buyingPrice * item.quantity;
    }, 0);
    const totalSavings = cartItems.reduce((sum, item) => {
        const savingPrice = Math.floor(item.originalPrice * (item.discount / 100));
        return sum + savingPrice * item.quantity;
    }, 0);

    return (
        <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh]'>
            {/* When Cart is empty */}
            {cartItems.length === 0 && (
                <div className="w-fit mx-auto my-32 px-10 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 justify-center items-center border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all duration-300 ease-out shadow-lg hover:shadow-2xl hover:-translate-y-3 scale-110 transform-gpu group space-y-4">
                    <h1 className='text-4xl font-bold text-center opacity-90'>Your Cart is Empty</h1>
                    <div className='flex flex-col items-center justify-center gap-2'>
                        <p className='text-gray-600 dark:text-gray-400'>Your shopping cart is waiting.</p>
                        <p className='text-gray-600 dark:text-gray-400 flex items-center text-md gap-1'>
                            <Link href="/books" className='text-black dark:text-white underline'>Browse Books</Link> to get started.
                        </p>
                    </div>
                </div>
            )}

            {/* Cart Items if not empty */}
            {cartItems.length > 0 && (
                <div className="cart-container space-y-6 my-10">
                    <SectionHeader title="Your Cart" />
                    <div className="cart-items space-y-4">
                        {cartItems.map((item) => (
                            <CartCard 
                                key={item.id} 
                                item={item} 
                                onQuantityChange={handleQuantityChange} 
                                onRemove={handleRemove} 
                            />
                        ))}
                    </div>
                    
                    {/* Cart Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-8">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
