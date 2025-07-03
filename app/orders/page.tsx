"use client";
import React, { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp, X } from "lucide-react"
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
    const [searchQuery, setSearchQuery] = useState<string>("");

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
            <div className="font-[family-name:var(--font-poppins)] w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    {/* Package Icon */}
                    <div className="mb-6 sm:mb-8">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <svg 
                                className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 dark:text-blue-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                            No Orders Yet
                        </h1>
                        
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Start your reading adventure by placing your first order. Your order history will appear here.
                        </p>

                        {/* Features List */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                What you&#39;ll get with every order:
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Fast and reliable delivery
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Real-time order tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Secure payment processing
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Easy returns and support
                                </li>
                            </ul>
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-3 sm:space-y-4">
                            <Link 
                                href="/cart" 
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Go to Cart
                            </Link>
                            
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                                Add books to your cart and complete your first order
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Filter orders based on search query
    const filteredOrders = orders.filter(order => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const totalAmount = order.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
        
        return (
            String(order.id).toLowerCase().includes(query) ||
            String(order.delivery_status || '').toLowerCase().includes(query) ||
            String(totalAmount).toLowerCase().includes(query) ||
            String(order.shipping_address).toLowerCase().includes(query) ||
            order.items.some(item => 
                String(item.title).toLowerCase().includes(query) ||
                String(item.authors || '').toLowerCase().includes(query)
            )
        );
    });

    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Your Orders</h1>
                <div className="relative w-full sm:w-auto">
                    <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-3 pr-10 w-full sm:w-64 rounded-[0.5rem] placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {searchQuery && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[0.5rem]">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Showing {filteredOrders.length} of {orders.length} orders matching &quot;{searchQuery}&quot;
                    </p>
                </div>
            )}

            <div className="space-y-4 sm:space-y-6">
                {filteredOrders.map((order) => {
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
                                                                    ₹{item.price_at_time.toFixed(2)} x {item.quantity}
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
                                        {order.tracking_number && order.delivery_status !== 'Delivered' && order.delivery_status !== 'Cancelled' && (
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
