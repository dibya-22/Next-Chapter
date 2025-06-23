"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronLeft, ChevronRight, BadgeCheck, XCircle, Clock, Truck, Package, PackageCheck, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer, Bounce } from 'react-toastify';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    payment_status: string;
    delivery_status: string;
    created_at: string;
    user_name: string;
    user_email: string;
}

const ORDER_STATUSES = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
] as const;

export default function OrdersPage() {
    const { userId, isLoaded } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 10;
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedNewStatus, setSelectedNewStatus] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!userId || !isLoaded) return;

        try {
            const response = await fetch('/api/admin/orders/get-orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data.orders);
            setTotalOrders(data.total);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    }, [userId, isLoaded]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/admin/orders/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, delivery_status: newStatus }
                    : order
            ));
            toast.success('Order status updated successfully');
        } catch {
            toast.error('Failed to update order status');
        }
    };

    const getStatusColor = (status: string) => {
        if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
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
                day: "numeric"
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

    const getStatusIndex = (status: string) => {
        return ORDER_STATUSES.indexOf(status as typeof ORDER_STATUSES[number]);
    }

    const isPastStatus = (currentStatus: string, targetStatus: string) => {
        const currentIndex = getStatusIndex(currentStatus);
        const targetIndex = getStatusIndex(targetStatus);
        return targetIndex < currentIndex;
    }

    const handleStatusUpdateDialog = async () => {
        if (!selectedOrder || !selectedNewStatus) return;
        try {
            setActionLoading('updating');
            await handleStatusUpdate(selectedOrder.id, selectedNewStatus);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        } finally {
            setActionLoading(null);
            setShowStatusDialog(false);
            setShowConfirmDialog(false);
            setSelectedOrder(null);
            setSelectedNewStatus(null);
        }
    }

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading('cancelling');
            await handleStatusUpdate(selectedOrder.id, 'Cancelled');
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        } finally {
            setActionLoading(null);
            setShowCancelDialog(false);
            setSelectedOrder(null);
        }
    }

    // Helper for badge design
    function renderStatusBadge(status: string) {
        let color = '';
        let icon = null;
        let label = status;
        switch (status.toLowerCase()) {
            case 'completed':
                color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
                icon = <BadgeCheck className="w-4 h-4 mr-1" />;
                label = 'Completed';
                break;
            case 'refunded':
                color = 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-700';
                icon = <XCircle className="w-4 h-4 mr-1" />;
                label = 'Refunded';
                break;
            case 'pending':
                color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
                icon = <Clock className="w-4 h-4 mr-1" />;
                label = 'Pending';
                break;
            case 'processing':
                color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
                icon = <Loader2 className="w-4 h-4 mr-1 animate-spin" />;
                label = 'Processing';
                break;
            case 'shipped':
                color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700';
                icon = <Truck className="w-4 h-4 mr-1" />;
                label = 'Shipped';
                break;
            case 'out for delivery':
                color = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
                icon = <Package className="w-4 h-4 mr-1" />;
                label = 'Out for Delivery';
                break;
            case 'delivered':
                color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700';
                icon = <PackageCheck className="w-4 h-4 mr-1" />;
                label = 'Delivered';
                break;
            case 'cancelled':
                color = 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
                icon = <XCircle className="w-4 h-4 mr-1" />;
                label = 'Cancelled';
                break;
            default:
                color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
                icon = <Clock className="w-4 h-4 mr-1" />;
                label = status;
        }
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} gap-1`}>
                {icon}{label}
            </span>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-screen-xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
                <Card className="overflow-x-auto border-border">
                    <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 border-b">
                        <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
                        <Button variant="outline" size="sm" className="rounded-[0.5rem]" disabled>
                            Refresh
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[900px]">
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
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-screen-xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
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
            <Card className="overflow-x-auto border-border">
                <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 border-b">
                    <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
                    <Button onClick={() => fetchOrders()} variant="outline" size="sm" className="rounded-[0.5rem]">
                        Refresh
                    </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
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
                                        {renderStatusBadge(order.payment_status)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderStatusBadge(order.delivery_status)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground text-center">
                                        {formatDate(order.created_at)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground text-center">
                                        {order.delivery_status === 'Delivered' ? formatDate(order.created_at) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#F5F5DC] dark:bg-[#2B2B2B]">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowStatusDialog(true);
                                                }}>
                                                    Update Status
                                                </DropdownMenuItem>
                                                {order.delivery_status !== 'Delivered' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-rose-600"
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setShowCancelDialog(true);
                                                            }}
                                                        >
                                                            Cancel Order
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t gap-2 md:gap-0">
                    <div className="text-sm text-muted-foreground mb-2 md:mb-0">
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
                        <div className="flex items-center gap-1 overflow-x-auto">
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
            {/* Status Update Dialog */}
            <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogContent className="bg-[#F5F5DC] dark:bg-[#2B2B2B]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Order Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the new status for order #{selectedOrder?.id}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-2 gap-2 py-4">
                        {ORDER_STATUSES.map((status) => {
                            const isPast = selectedOrder ? isPastStatus(selectedOrder.delivery_status, status) : false;
                            return (
                                <Button
                                    key={status}
                                    variant="outline"
                                    className={`justify-start rounded-full ${
                                        isPast 
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                                            : getStatusColor(status)
                                    }`}
                                    disabled={isPast}
                                    onClick={() => {
                                        setSelectedNewStatus(status);
                                        setShowConfirmDialog(true);
                                    }}
                                >
                                    {status}
                                </Button>
                            );
                        })}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirmation Dialog for ALL status changes */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-[#F5F5DC] dark:bg-[#2B2B2B]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the status of order #{selectedOrder?.id} to {selectedNewStatus}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setShowConfirmDialog(false);
                                setSelectedNewStatus(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusUpdateDialog}
                            className="bg-yellow-600 hover:bg-yellow-700"
                            disabled={actionLoading === 'updating'}
                        >
                            {actionLoading === 'updating' ? 'Updating...' : 'Yes, change status'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Order Dialog (from dropdown, not status) */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className="bg-[#F5F5DC] dark:bg-[#2B2B2B]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel order #{selectedOrder?.id}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, keep order</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelOrder}
                            className="bg-rose-600 hover:bg-rose-700"
                            disabled={actionLoading === 'cancelling'}
                        >
                            {actionLoading === 'cancelling' ? 'Cancelling...' : 'Yes, cancel order'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
