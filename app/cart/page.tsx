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
import { toast } from 'react-toastify';
import { CartSkeleton } from '@/components/cart/cart-skeleton';

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
        if (isLoaded && isSignedIn) {
            fetchCartItems();
        } else if (isLoaded && !isSignedIn) {
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn]);

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
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }
    const handlePaymentSuccess = async (response: RazorpayPaymentResponse) => {
        try {
            const verificationResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                }),
            });

            const verificationData = await verificationResponse.json();
            if (verificationData.success) {
                toast.success('Payment successful!');
                router.push('/orders');
            } else {
                toast.error('Payment verification failed');
            }
        } catch {
            toast.error('Error verifying payment');
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

    if (!isLoaded || isLoading) {
        return <CartSkeleton />;
    }

    if (!isSignedIn) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-full max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col items-center justify-center gap-4 min-h-[50vh]'>
                <h1 className='text-xl sm:text-2xl font-bold text-center'>Please Sign In</h1>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center'>You need to be signed in to view your cart.</p>
                <SignInButton mode="modal">
                    <Button variant="custom">Sign In</Button>
                </SignInButton>
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
        <div className='font-[family-name:var(--font-poppins)] w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28'>
            {error && (
                <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm sm:text-base">
                    {error}
                </div>
            )}
            
            {/* When Cart is empty */}
            {cartItems.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    {/* Shopping Cart Icon */}
                    <div className="mb-6 sm:mb-8">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <svg 
                                className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500 dark:text-emerald-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                            Your Cart is Empty
                        </h1>
                        
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Ready to start your reading journey? Add some amazing books to your cart.
                        </p>

                        {/* Features List */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Why shop with us?
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Fast and secure checkout
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Free shipping on orders above ₹500
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Easy returns and exchanges
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Quality books at great prices
                                </li>
                            </ul>
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-3 sm:space-y-4">
                            <Link 
                                href="/books" 
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Start Shopping
                            </Link>
                            
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                                Click &#34;Add to Cart&#34; on any book to get started
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Items if not empty */}
            {cartItems.length > 0 && (
                <div className="cart-container space-y-4 sm:space-y-6 lg:space-y-8 mb-6 sm:mb-10">
                    <SectionHeader title="Your Cart" />
                    <div className="cart-items space-y-3 sm:space-y-4">
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
                    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mt-6 sm:mt-8 ${isProcessing ? 'opacity-50' : ''}`}>
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Summary</h2>
                        <div className="items flex flex-col gap-2 sm:gap-4 ml-2 sm:ml-5 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            {cartItems.map((item, i) => (
                                <div key={i} className='item flex justify-between items-center'>
                                    <span className="flex-1 min-w-0 pr-2 line-clamp-1">{item.title} x{item.quantity}</span> 
                                    <span className="flex-shrink-0">₹{(Math.floor(item.originalPrice - item.originalPrice * (item.discount / 100))) * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className='w-full h-0.5 my-3 mx-auto bg-black dark:bg-white'></div>
                        <div className="total">
                            <div className='flex justify-between items-center font-semibold text-base sm:text-lg'>
                                <span>Total ({totalItems} items)</span> 
                                <span>₹{totalPrice}</span>
                            </div>
                        </div>
                        <div className="saved text-emerald-400 font-semibold flex justify-end gap-1 text-sm sm:text-base">
                            <span>Saved </span> 
                            <span>₹{totalSavings}</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mt-6 sm:mt-8">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-xl flex items-center justify-center z-10">
                                <div className="flex items-center gap-2 text-sm sm:text-base">
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
