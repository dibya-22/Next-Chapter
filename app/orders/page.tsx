"use client";
import React, { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from "lucide-react"
import OrderStatusBar from "@/components/order-status-bar";
import { formatDate } from "@/lib/utils";

interface OrderItem {
    id: number;
    title: string;
    authors: string;
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
}

const Order = () => {
    const { isSignedIn } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    useEffect(() => {
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

        if (isSignedIn) {
            fetchOrders();
        }
    }, [isSignedIn]);

    const toggleOrderExpansion = (orderId: number) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    if (!isSignedIn) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh] flex flex-col items-center justify-center gap-4'>
                <h1 className='text-2xl font-bold'>Please Sign In</h1>
                <p className='text-gray-600 dark:text-gray-400'>You need to be signed in to view your orders.</p>
                <SignInButton mode="modal">
                    <Button variant="custom">Sign In</Button>
                </SignInButton>
            </div>
        );
    }

    if (loading) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh]'>
                <h1 className='text-2xl font-bold mb-6'>Your Orders</h1>
                <p>Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh]'>
                <h1 className='text-2xl font-bold mb-6'>Your Orders</h1>
                <p className='text-red-500'>{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="w-fit mx-auto my-32 px-10 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 justify-center items-center border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all duration-300 ease-out shadow-lg hover:shadow-2xl hover:-translate-y-3 scale-110 transform-gpu group space-y-4">
                <h1 className='text-4xl font-bold text-center opacity-90'>No Order Placed</h1>
                <div className='flex flex-col items-center justify-center gap-2'>
                    <p className='text-gray-600 dark:text-gray-400 flex items-center text-md gap-1'>
                        <Link href="/cart" className='text-black dark:text-white underline'>Go to Cart</Link> to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => {
                    const isExpanded = expandedOrders[order.id] || false;
                    const totalAmount = order.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

                    return (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className={`p-5 ${isExpanded ? "border-b border-gray-200 dark:border-gray-700" : ""}`}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold">Order #{order.id}</h2>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${order.delivery_status === "Delivered"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : order.delivery_status === "Shipped" || order.delivery_status === "Out for Delivery"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                    }`}
                                            >
                                                {order.delivery_status || 'Order Placed'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Ordered on {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Total</p>
                                            <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleOrderExpansion(order.id)}
                                            aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                                        >
                                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-5">
                                    <div className="mb-6">
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
                                        <div className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
                                            Estimated Delivery:{" "}
                                            <span className="font-medium">{formatDate(order.estimated_delivery_date)}</span>
                                        </div>
                                    </div>

                                    <div className="address">
                                        <h3 className="text-lg font-bold mb-2">Shipping Address</h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-[0.5rem]">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{order.shipping_address}</p>
                                        </div>
                                    </div>

                                    <div className="items mt-6">
                                        <h3 className="text-lg font-bold mb-3">Order Items</h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-[0.5rem] overflow-hidden">
                                            {order.items.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center p-4 ${index !== order.items.length - 1 ? "border-b border-gray-200 dark:border-gray-600" : ""
                                                        }`}
                                                >
                                                    <div className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden">
                                                        <Image
                                                            src={item.thumbnail || "/placeholder.svg"}
                                                            alt={item.title}
                                                            width={64}
                                                            height={64}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <h4 className="text-md font-semibold">{item.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">by {item.authors}</p>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                                                ₹{item.price_at_time.toFixed(2)} × {item.quantity}
                                                            </p>
                                                            <p className="font-medium">₹{(item.price_at_time * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-[0.5rem]">
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>₹{totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        {order.tracking_number && (
                                            <Button variant="outline">Track Package</Button>
                                        )}
                                        <Button>Need Help?</Button>
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
