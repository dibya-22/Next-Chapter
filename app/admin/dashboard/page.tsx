"use client";
import React, { useState, useEffect } from 'react';
import {
    Users, UserCheck, UserX,
    CreditCard, IndianRupee, CalendarDays,
    Activity, Truck, Clock, Receipt,
    Book, BookCheck, BookCopy, CircleAlert, FolderOpen
} from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton";
import { getMonth } from '@/lib/utils';
import { toast } from "react-toastify";


interface RecentOrder {
    id: string | number;
    customer_name: string;
    amount: number;
    status: string;
}

interface DashboardData {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalRevenue: number;
    totalPayments: number;
    monthlyRevenue: number;
    refundedPayments: number;
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalBooks: number;
    totalSold: number;
    totalStock: number;
    outOfStock: number;
    totalCategories: number;
    recentOrders: RecentOrder[];
}

function MetricCardSkeleton() {
    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-3 w-[140px]" />
            </CardContent>
        </Card>
    )
}

function MetricSectionSkeleton({ 
    gridCols = "md:grid-cols-2 lg:grid-cols-4",
    itemCount = 4 
}: { 
    gridCols?: string;
    itemCount?: number;
}) {
    return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-6 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className={`grid gap-4 ${gridCols}`}>
                {[...Array(itemCount)].map((_, i) => (
                    <MetricCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const { userId, isLoaded } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        totalRevenue: 0,
        totalPayments: 0,
        monthlyRevenue: 0,
        refundedPayments: 0,
        totalOrders: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        totalBooks: 0,
        totalSold: 0,
        totalStock: 0,
        outOfStock: 0,
        totalCategories: 0,
        recentOrders: []
    });

    // User Data
    const usersMetrics = [
        {
            title: "Total Users",
            value: (dashboardData?.totalUsers || 0).toLocaleString(),
            icon: Users,
            description: "Registered users",
            cardClass: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            iconClass: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Active Users",
            value: (dashboardData?.activeUsers || 0).toLocaleString(),
            icon: UserCheck,
            description: "Active users",
            cardClass: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
            iconClass: "text-green-600 dark:text-green-400",
        },
        {
            title: "Blocked Users",
            value: (dashboardData?.blockedUsers || 0).toLocaleString(),
            icon: UserX,
            description: "Blocked users",
            cardClass: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
            iconClass: "text-red-600 dark:text-red-400",
        }
    ]

    // Payment Data
    const financialMetrics = [
        {
            title: "Total Payments",
            value: (dashboardData?.totalPayments || 0).toLocaleString(),
            icon: CreditCard,
            description: "All time payments",
            cardClass: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            iconClass: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Total Revenue",
            value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString()}`,
            icon: IndianRupee,
            description: "All time revenue",
            cardClass: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
            iconClass: "text-green-600 dark:text-green-400",
        },
        {
            title: "Monthly Revenue",
            value: `₹${(dashboardData?.monthlyRevenue || 0).toLocaleString()}`,
            icon: CalendarDays,
            description: `${getMonth()}'s revenue`,
            cardClass: "bg-purple-200 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
            iconClass: "text-purple-600 dark:text-purple-400",
        },
        {
            title: "Refunded Payments",
            value: `${(dashboardData?.refundedPayments || 0).toLocaleString()}`,
            icon: CalendarDays,
            description: "Refunded payments",
            cardClass: "bg-red-200 dark:bg-red-900/20 border-red-200 dark:border-red-800",
            iconClass: "text-red-600 dark:text-red-400",
        }
    ]

    // Order Data
    const ordersMetrics = [
        {
            title: "Total Orders",
            value: (dashboardData?.totalOrders || 0).toLocaleString(),
            icon: Activity,
            description: "All time orders",
            cardClass: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            iconClass: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Delivered Orders",
            value: (dashboardData?.deliveredOrders || 0).toLocaleString(),
            icon: Truck,
            description: "Successfully delivered",
            cardClass: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
            iconClass: "text-green-600 dark:text-green-400",
        },
        {
            title: "Pending Orders",
            value: (dashboardData?.pendingOrders || 0).toLocaleString(),
            icon: Clock,
            description: "Awaiting processing",
            cardClass: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
            iconClass: "text-yellow-600 dark:text-yellow-400",
        },
        {
            title: "Cancelled Orders",
            value: (dashboardData?.cancelledOrders || 0).toLocaleString(),
            icon: Receipt,
            description: "Cancelled orders",
            cardClass: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
            iconClass: "text-red-600 dark:text-red-400",
        },
    ]

    const booksMetrics = [
        {
            title: "Total Registered Books",
            value: (dashboardData?.totalBooks || 0).toLocaleString(),
            icon: Book,
            description: "Book in catalog",
            cardClass: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            iconClass: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Total Sold Books",
            value: (dashboardData?.totalSold || 0).toLocaleString(),
            icon: BookCheck,
            description: "Total books sold",
            cardClass: "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
            iconClass: "text-emerald-600 dark:text-emerald-400",
        },
        {
            title: "Total Stock",
            value: (dashboardData?.totalStock || 0).toLocaleString(),
            icon: BookCopy,
            description: "Available in inventory",
            cardClass: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
            iconClass: "text-green-600 dark:text-green-400",
        },
        {
            title: "Out of Stock",
            value: (dashboardData?.outOfStock || 0).toLocaleString(),
            icon: CircleAlert,
            description: "Books need restocking",
            cardClass: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
            iconClass: "text-red-600 dark:text-red-400",
        },
        {
            title: "Categories",
            value: (dashboardData?.totalCategories || 0).toLocaleString(),
            icon: FolderOpen,
            description: "Book Categories",
            cardClass: "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
            iconClass: "text-orange-600 dark:text-orange-400",
        },
    ]

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userId || !isLoaded) return;

            try {
                const response = await fetch('/api/admin/fetch-dashboard-info');
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                const data = await response.json();
                setDashboardData(data);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId, isLoaded]);

    function MetricCard({
        title,
        value,
        icon: Icon,
        description,
        cardClass,
        iconClass,
    }: {
        title: string
        value: string
        icon: React.ElementType
        description: string
        cardClass?: string
        iconClass?: string
    }) {
        return (
            <Card className={`hover:shadow-lg transition-all duration-300 ${cardClass}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-charcoal-800 dark:text-cream-100">{title}</CardTitle>
                    <Icon className={`h-5 w-5 ${iconClass}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-charcoal-900 dark:text-cream-100">{value}</div>
                    <p className="text-xs text-charcoal-600 dark:text-cream-300 mt-1">{description}</p>
                </CardContent>
            </Card>
        )
    }

    type Metric = {
        title: string
        value: string
        icon: React.ElementType
        description: string
        cardClass?: string
        iconClass?: string
    };

    function MetricSection({
        title,
        description,
        metrics,
        gridCols = "md:grid-cols-2 lg:grid-cols-3",
    }: {
        title: string
        description: string
        metrics: Metric[]
        gridCols?: string
    }) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-charcoal-900 dark:text-cream-100">{title}</h2>
                    <p className="text-sm text-charcoal-600 dark:text-cream-300">{description}</p>
                </div>
                <div className={`grid gap-4 ${gridCols}`}>
                    {metrics.map((metric, index) => (
                        <MetricCard key={index} {...metric} />
                    ))}
                </div>
            </div>
        )
    }

    if (!isLoaded || isLoading) {
        return (
            <div className="space-y-4 p-4">
                <div>
                    <Skeleton className="h-8 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[400px]" />
                </div>

                <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

                <MetricSectionSkeleton itemCount={usersMetrics.length} />

                <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

                <MetricSectionSkeleton itemCount={booksMetrics.length} />

                <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

                <MetricSectionSkeleton itemCount={ordersMetrics.length} />

                <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

                <MetricSectionSkeleton itemCount={financialMetrics.length} gridCols="md:grid-cols-3 lg:grid-cols-4" />
            </div>
        )
    }

    if (!userId) {
        return (
            <div>Please sign in to view the dashboard</div>
        )
    }

    return (
        <div className="space-y-4 p-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-300">Welcome back! Here&#39;s what&#39;s happening with your bookstore.</p>
            </div>

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSection
                title="Users Overview"
                description="Quick stats about users"
                metrics={usersMetrics}
                gridCols="md:grid-cols-2 lg:grid-cols-4"
            />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSection
                title="Financial Overview"
                description="Quick stats about payments and revenue"
                metrics={financialMetrics}
                gridCols="md:grid-cols-2 lg:grid-cols-4"
            />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSection
                title="Orders Overview"
                description="Quick stats about orders"
                metrics={ordersMetrics}
                gridCols="md:grid-cols-2 lg:grid-cols-4"
            />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <MetricSection
                title="Inventory Overview"
                description="Quick stats about books"
                metrics={booksMetrics}
                gridCols="md:grid-cols-2 lg:grid-cols-4"
            />

            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {dashboardData.recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">₹{order.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}