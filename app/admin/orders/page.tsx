"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer, toast, Bounce } from 'react-toastify';

interface Order {
    id: string | number
    user_id: string | number
    total_amount: number
    payment_status: string
    delivery_status: string
    created_at: string | Date
    updated_at: string | Date
    delivered_date: string | Date
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 10;

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/orders/get-orders?page=${page}&limit=${itemsPerPage}`);
            const data = await response.json();
            if (!Array.isArray(data.orders)) {
                setOrders([]);
                setTotalOrders(0);
                return;
            }
            setOrders(data.orders);
            setTotalOrders(data.total);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
            setTotalOrders(0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "order placed":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case "processing":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            case "shipped":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            case "out for delivery":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
            case "delivered":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
            case "cancelled":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    function formatCurrency(amount: number): string {
        if (isNaN(amount)) return "₹0.00";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatDate(date: string | Date | null): string {
        if (!date) return "N/A";
        try {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
        } catch (error) {
            console.error("Invalid date format:", date, error);
            return "Invalid Date";
        }
    }

    function truncateId(id: string | number, start = 6, end = 4): string {
        const str = String(id);
        if (str.length <= start + end) return str;
        return `${str.slice(0, start)}...${str.slice(-end)}`;
    }

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return
        setCurrentPage(page)
    }

    const copyToClipboard = (text: string | number) => {
        navigator.clipboard.writeText(String(text));
        toast.success("Copied to clipboard!");
    }

    if (loading) {
        return (
            <div className="w-full p-3">
                <Card className="overflow-hidden border-border">
                    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
                        <h1 className="text-2xl font-bold">Orders</h1>
                        <Button variant="outline" size="sm" className="rounded-[0.5rem]" disabled>
                            Refresh
                        </Button>
                    </CardHeader>
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px] text-center">Order ID</TableHead>
                                <TableHead className="w-[150px] text-center">User ID</TableHead>
                                <TableHead className="w-[150px] text-center">Amount</TableHead>
                                <TableHead className="w-[150px] text-center">Payment Status</TableHead>
                                <TableHead className="w-[150px] text-center">Delivery Status</TableHead>
                                <TableHead className="w-[200px] text-center">Order Date</TableHead>
                                <TableHead className="w-[200px] text-center">Delivered Date</TableHead>
                                <TableHead className="w-[80px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[100px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px] mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[40px] mx-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full p-3">
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <Card className="overflow-hidden border-border">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <Button onClick={() => fetchOrders(currentPage)} variant="outline" size="sm" className="rounded-[0.5rem]">
                        Refresh
                    </Button>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[100px] text-center">Order ID</TableHead>
                            <TableHead className="w-[150px] text-center">User ID</TableHead>
                            <TableHead className="w-[150px] text-center">Amount</TableHead>
                            <TableHead className="w-[150px] text-center">Payment Status</TableHead>
                            <TableHead className="w-[150px] text-center">Delivery Status</TableHead>
                            <TableHead className="w-[200px] text-center">Order Date</TableHead>
                            <TableHead className="w-[200px] text-center">Delivered Date</TableHead>
                            <TableHead className="w-[80px] text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className="group hover:bg-muted/50 transition-colors">
                                <TableCell onClick={() => copyToClipboard(order.id)} className="font-mono text-xs text-muted-foreground text-center transform active:scale-95 cursor-pointer" title={String(order.id)}>
                                    {truncateId(order.id)}
                                </TableCell>
                                <TableCell onClick={() => copyToClipboard(order.user_id)} className="font-mono text-xs text-muted-foreground text-center transform active:scale-95 cursor-pointer" title={String(order.user_id)}>
                                    {truncateId(order.user_id)}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                    {formatCurrency(Number(order.total_amount))}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span
                                        className={`${getStatusColor(order.payment_status)} inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                    >
                                        {order.payment_status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span
                                        className={`${getStatusColor(order.delivery_status)} inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                    >
                                        {order.delivery_status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground text-center">
                                    {formatDate(order.created_at)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground text-center">
                                    {order.delivery_status === 'Delivered' ? formatDate(order.delivered_date) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-rose-600">Cancel Order</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-[0.5rem]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    className="rounded-[0.5rem] w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded-[0.5rem]"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Orders
