"use client";
import React, { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from "lucide-react"
import OrderStatusBar from "@/components/order/order-status-bar";
import BookReview from "@/components/order/book-review";
import { formatDate } from "@/lib/utils";
import { OrderSkeleton } from "@/components/order/order-skeleton";

interface OrderItem {
    id: number;
    book_id: number;
    title: string;
    authors?: string[];
    thumbnail: string;
    quantity: number;
    price_at_time: number;
}

interface Order {
    id: number;
    tracking_number: string | null;
    delivery_status: string | null;
    estimated_delivery_date: string | null;
    created_at: string;
    shipping_address: string;
    items: OrderItem[];
    payment_status: string;
    is_reviewed: boolean;
}

const Order = () => {
    const { isLoaded, isSignedIn } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchOrders();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn]);

    const handleReviewSubmitted = () => {
        // Refresh orders to update the is_reviewed status
        fetchOrders();
    };

    const toggleOrderExpansion = (orderId: number) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    if (!isLoaded || loading) {
        return <OrderSkeleton />;
    }

    if (!isSignedIn) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-full max-w-2xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 flex flex-col items-center justify-center gap-4 min-h-[50vh]'>
                <h1 className='text-xl sm:text-2xl font-bold text-center'>Please Sign In</h1>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center'>You need to be signed in to view your orders.</p>
                <SignInButton mode="modal">
                    <Button variant="custom">Sign In</Button>
                </SignInButton>
            </div>
        );
    }

    if (error) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6'>Your Orders</h1>
                <p className='text-sm sm:text-base text-red-500'>{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="w-full max-w-md mx-auto my-20 sm:my-32 px-6 sm:px-10 py-6 sm:py-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 justify-center items-center border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all duration-300 ease-out shadow-lg hover:shadow-2xl hover:-translate-y-2 scale-105 transform-gpu group space-y-4">
                <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-center opacity-90'>No Order Placed</h1>
                <div className='flex flex-col items-center justify-center gap-2'>
                    <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center text-center gap-1'>
                        <Link href="/cart" className='text-black dark:text-white underline'>Go to Cart</Link> to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8">Your Orders</h1>

            <div className="space-y-4 sm:space-y-6">
                {orders.map((order) => {
                    const isExpanded = expandedOrders[order.id] || false;
                    const totalAmount = order.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

                    return (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className={`p-4 sm:p-5 ${isExpanded ? "border-b border-gray-200 dark:border-gray-700" : ""}`}>
                                {/* Mobile Layout */}
                                <div className="block sm:hidden">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-base font-bold">Order #{order.id}</h2>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${order.delivery_status === "Delivered"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : order.delivery_status === "Shipped" || order.delivery_status === "Out for Delivery"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                        }`}
                                                >
                                                    {order.delivery_status || 'Order Placed'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleOrderExpansion(order.id)}
                                            aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                                            className="flex-shrink-0"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                            <span className="ml-1 font-bold">₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <h2 className="text-base sm:text-lg font-bold">Order #{order.id}</h2>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full w-fit ${order.delivery_status === "Delivered"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : order.delivery_status === "Shipped" || order.delivery_status === "Out for Delivery"
                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                    }`}
                                            >
                                                {order.delivery_status || 'Order Placed'}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Ordered on {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3">
                                        <div className="text-right">
                                            <p className="text-xs sm:text-sm font-medium">Total</p>
                                            <p className="text-base sm:text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleOrderExpansion(order.id)}
                                            aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                                            className="flex-shrink-0"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 sm:p-5">
                                    {order.delivery_status !== "Cancelled" ?
                                        <div className="mb-4 sm:mb-6">
                                            <OrderStatusBar
                                                currentStatus={
                                                    order.delivery_status as
                                                    | "Order Placed"
                                                    | "Processing"
                                                    | "Shipped"
                                                    | "Out for Delivery"
                                                    | "Delivered"
                                                }
                                            />
                                            <div className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
                                                Estimated Delivery:{" "}
                                                <span className="font-medium">{formatDate(order.estimated_delivery_date)}</span>
                                            </div>
                                        </div>
                                        :
                                        <div className='p-4 sm:p-5 flex flex-col items-center justify-center text-center'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mb-2 sm:mb-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Order Cancelled</h3>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This order has been cancelled.</p>
                                        </div>
                                    }

                                    <div className="address mb-4 sm:mb-6">
                                        <h3 className="text-base sm:text-lg font-bold mb-2">Shipping Address</h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-[0.5rem]">
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{order.shipping_address}</p>
                                        </div>
                                    </div>

                                    <div className="items mb-4 sm:mb-6">
                                        <h3 className="text-base sm:text-lg font-bold mb-3">Order Items</h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-[0.5rem] overflow-hidden">
                                            {order.items.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`p-3 sm:p-4 ${index !== order.items.length - 1 ? "border-b border-gray-200 dark:border-gray-600" : ""
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 relative rounded-md overflow-hidden">
                                                            <Image
                                                                src={item.thumbnail || "/placeholder.svg"}
                                                                alt={item.title}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 640px) 48px, 64px"
                                                            />
                                                        </div>
                                                        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                                                            <h4 className="text-sm sm:text-md font-semibold line-clamp-2">{item.title}</h4>
                                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                                by {Array.isArray(item.authors) ? item.authors.join(', ') : 'Unknown Author'}
                                                            </p>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                                                                    ₹{item.price_at_time.toFixed(2)} × {item.quantity}
                                                                </p>
                                                                <p className="text-sm sm:text-base font-medium">₹{(item.price_at_time * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Show review component for delivered orders that haven't been reviewed */}
                                                    {order.delivery_status === 'Delivered' && !order.is_reviewed && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                            <BookReview
                                                                orderId={order.id}
                                                                bookId={item.book_id}
                                                                onReviewSubmitted={handleReviewSubmitted}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-3 sm:mt-4 bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-[0.5rem]">
                                            <div className="flex justify-between font-bold text-sm sm:text-base">
                                                <span>Total</span>
                                                <span>₹{totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3'>
                                        {order.tracking_number && (
                                            <Button variant="outline" className="text-xs sm:text-sm">Track Package</Button>
                                        )}
                                        <Button className="text-xs sm:text-sm">Need Help?</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Order;
