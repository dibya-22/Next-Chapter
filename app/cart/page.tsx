"use client";
import React, { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CartCard } from '@/components/cart/cart-item-card';
import { SectionHeader } from '@/components/section-header';
import { CartItem } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CheckoutForm from '@/components/cart/checkout-form'


declare global {
    interface Window {
        Razorpay: unknown;
    }
}

const Cart = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

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


    interface RazorpayPaymentResponse {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }
    const handlePaymentSuccess = async (response: RazorpayPaymentResponse) => {
        try {
            console.log('Payment success response:', response); // Debug log

            const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                })
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
                console.error('Payment verification failed:', {
                    status: verifyResponse.status,
                    statusText: verifyResponse.statusText,
                    data: verifyData,
                    response: response
                });
                throw new Error(verifyData.error || verifyData.details || 'Payment verification failed');
            }

            // Success - clear cart and redirect
            setCartItems([]);
            router.push('/orders');
        } catch (error) {
            console.error('Payment verification error:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                response: response
            });
            setError(error instanceof Error ? error.message : 'Payment verification failed. Please contact support.');
        }
    };

    const initializePayment = async (amount: number, shippingAddress: string) => {
        try {
            setIsProcessing(true);
            setError(null);
            
            // Create order in our database first
            const createOrderResponse = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    amount,
                    shippingAddress
                })
            });

            const orderData = await createOrderResponse.json();
            
            if (!createOrderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create order');
            }

            // Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount * 100,
                currency: "INR",
                name: "Next Chapter",
                description: "Book Purchase",
                order_id: orderData.orderId,
                handler: function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    handlePaymentSuccess(response);
                },
                prefill: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: user?.emailAddresses?.[0]?.emailAddress,
                },
                theme: {
                    color: "#000000"
                }
            };

            // Initialize Razorpay
            interface RazorpayConstructor {
                new (options: Record<string, unknown>): { open: () => void };
            }
            const Razorpay = window.Razorpay as RazorpayConstructor;
            const razorpay = new Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment initialization error:', error);
            setError(error instanceof Error ? error.message : 'Failed to initialize payment');
        } finally {
            setIsProcessing(false);
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
        <div className='font-[family-name:var(--font-poppins)] w-[calc(100vw-0.5rem)] md:w-[70vw] md:mx-auto mx-2 mt-[11vh] overflow-x-hidden'>
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                    {error}
                </div>
            )}
            
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
                <div className="cart-container space-y-6 mb-10">
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
                    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-8 ${isProcessing ? 'opacity-50' : ''}`}>
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="items flex flex-col gap-4 ml-5 text-gray-700 dark:text-gray-300">
                            {cartItems.map((item, i) => (
                                <div key={i} className='item flex justify-between items-center'><span>{item.title} x{item.quantity}</span> <span>₹{(Math.floor(item.originalPrice - item.originalPrice * (item.discount / 100))) * item.quantity}</span></div>
                            ))}
                        </div>
                        <div className='w-full h-0.5 my-3 mx-auto bg-black dark:bg-white'></div>
                        <div className="total">
                            <div className='flex justify-between items-center font-semibold'><span>Total ({totalItems} items)</span> <span>₹{totalPrice}</span></div>
                        </div>
                        <div className="saved text-emerald-400 font-semibold flex justify-end gap-1"><span>Saved </span> <span>₹{totalSavings}</span></div>
                    </div>

                    {/* Checkout */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-8">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-xl flex items-center justify-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-t-transparent border-black dark:border-white rounded-full animate-spin"></div>
                                    <span>Processing payment...</span>
                                </div>
                            </div>
                        )}
                        <CheckoutForm 
                            user={{
                                firstName: user?.firstName || '',
                                lastName: user?.lastName || '',
                                email: user?.emailAddresses?.[0]?.emailAddress || '',
                                address: {
                                    street: '',
                                    city: '',
                                    state: '',
                                    zipCode: '',
                                    country: ''
                                }
                            }}
                            totalAmount={totalPrice}
                            onPaymentInit={initializePayment}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
