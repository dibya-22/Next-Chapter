"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Shield,
    UserIcon,
    Mail,
    Calendar,
    ShoppingBag,
    MoreVertical,
    Ban,
    UserCheck,
    Settings,
    Package,
    CreditCard,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { formatDate, capitalizeFirstLetter } from "@/lib/utils"
import Link from "next/link"

interface OrderItem {
    book_id: string
    title: string
    author: string
    quantity: number
    price_at_time: number
    subtotal: number
}

interface Order {
    order_id: string
    created_at: string
    delivered_date?: string
    estimated_delivery_date?: string
    payment_status: string
    delivery_status: string
    tracking_number?: string
    shipping_address?: string
    total_spent: number
    items: OrderItem[]
}

interface UserInfo {
    id: string
    firstName: string | null
    lastName: string | null
    username: string | null
    emailAddresses: {
        id: string
        emailAddress: string
        verification: {
            status: string
            strategy: string
        }
    }[]
    primaryEmailAddressId: string
    imageUrl: string
    createdAt: string
    updatedAt: string
    lastSignInAt: string | null
    publicMetadata: {
        role?: string
        status?: string
    }
    privateMetadata: {
        blocked?: boolean
    }
}

interface UserData {
    userInfo: UserInfo
    orders: Order[]
    totalSpent: string
}

const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return <Shield className="h-4 w-4 mr-1" />
        case 'user':
            return <UserIcon className="h-4 w-4 mr-1" />
        default:
            return <UserIcon className="h-4 w-4 mr-1" />
    }
}

const getDeliveryStatusIcon = (status: string) => {
    if(!status) return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    switch (status.toLowerCase()) {
        case "order placed":
            return <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        case "processing":
            return <Settings className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        case "shipped":
            return <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        case "out for delivery":
            return <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        case "delivered":
            return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        case "cancelled":
            return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        default:
            return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
}

const getPaymentStatusIcon = (status: string) => {
    if(!status) return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    switch (status.toLowerCase()) {
        case "completed":
            return <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        case "failed":
            return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        default:
            return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
}

const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    switch (status.toLowerCase()) {
        case "active":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        case "completed":
        case "delivered":
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
        case "banned":
        case "blocked":
        case "cancelled":
        case "failed":
            return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
        case "processing":
        case "shipped":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
        case "order placed":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        case "out for delivery":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
}

const getRoleBadge = (role: string) => {
    if (!role) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    switch (role.toLowerCase()) {
        case "admin":
            return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
        case "user":
            return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
        default:
            return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
}

const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

const UserProfile = () => {
    const params = useParams()
    const userId = params.userid as string
    const [userData, setUserData] = useState<UserData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(orderId)) {
                newSet.delete(orderId)
            } else {
                newSet.add(orderId)
            }
            return newSet
        })
    }

    const handleBlockUser = async () => {
        try {
            setActionLoading('block')
            const response = await fetch('/api/admin/users/update-user-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isDisabled: true }),
            })
            
            if (!response.ok) throw new Error('Failed to block user')
            
            await fetchUserData(userId)
            toast.success("User has been successfully blocked", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
        } catch (error) {
            console.error("Error blocking user:", error)
            toast.error("Failed to block user. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleUnblockUser = async () => {
        try {
            setActionLoading('unblock')
            const response = await fetch('/api/admin/users/update-user-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isDisabled: false }),
            })
            
            if (!response.ok) throw new Error('Failed to unblock user')
            
            await fetchUserData(userId)
            toast.success("User has been successfully unblocked", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
        } catch (error) {
            console.error("Error unblocking user:", error)
            toast.error("Failed to unblock user. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
        } finally {
            setActionLoading(null)
        }
    }

    const fetchUserData = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/get-user-profile?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch user data")
            }

            const data = await response.json()
            setUserData(data)
        } catch (error) {
            console.error("Error fetching user data:", error)
            setError("Error fetching user data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userId) {
            fetchUserData(userId)
        }
    }, [userId])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5DC] dark:bg-[#2b2b2b]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-800 dark:border-gray-200"></div>
            </div>
        )
    }

    if (error || !userData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5DC] dark:bg-[#2b2b2b]">
                <Card className="w-full max-w-md mx-4 bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">User Not Found</h3>
                            <p className="text-gray-700 dark:text-gray-300">{error || "The requested user could not be found."}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container p-6 space-y-6 bg-[#F5F5DC] dark:bg-[#2b2b2b] min-h-screen">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Profile</h1>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info Card - Sticky */}
                <div className="lg:sticky lg:top-6 lg:self-start lg:h-fit">
                    <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>User Information</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {userData.userInfo.privateMetadata.blocked ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className="text-green-600 dark:text-green-400"
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Unblock User
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Unblock User</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to unblock this user? They will regain access to their account.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleUnblockUser}
                                                            disabled={actionLoading === 'unblock'}
                                                        >
                                                            {actionLoading === 'unblock' ? 'Unblocking...' : 'Unblock'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        Block User
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Block User</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to block this user? They will lose access to their account.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleBlockUser}
                                                            disabled={actionLoading === 'block'}
                                                        >
                                                            {actionLoading === 'block' ? 'Blocking...' : 'Block'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={userData.userInfo.imageUrl} />
                                    <AvatarFallback>
                                        {userData.userInfo.firstName?.[0]}{userData.userInfo.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {userData.userInfo.firstName} {userData.userInfo.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        @{userData.userInfo.username}
                                    </p>
                                    <Badge className={`mt-2 ${getRoleBadge(userData.userInfo.publicMetadata.role || 'user')}`}>
                                        {getRoleIcon(userData.userInfo.publicMetadata.role)}
                                        {userData.userInfo.publicMetadata.role || 'User'}
                                    </Badge>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                {/* Email Section */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Addresses</p>
                                    {userData.userInfo.emailAddresses.map((email) => (
                                        <div key={email.id} className="flex flex-wrap items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">{email.emailAddress}</span>
                                            {email.id === userData.userInfo.primaryEmailAddressId && (
                                                <Badge variant="secondary" className="text-xs rounded-full">
                                                    Primary
                                                </Badge>
                                            )}
                                            {email.verification.status === "verified" && (
                                                <Badge variant="outline" className="text-xs rounded-full text-green-600 dark:text-green-400">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Account Information */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Information</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Created</span>
                                        </div>
                                        <span>{formatDate(userData.userInfo.createdAt)}</span>
                                        
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Last Sign In</span>
                                        </div>
                                        <span>{userData.userInfo.lastSignInAt ? formatDate(userData.userInfo.lastSignInAt) : 'Never'}</span>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Updated</span>
                                        </div>
                                        <span>{formatDate(userData.userInfo.updatedAt)}</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* User ID and Metadata */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Information</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Shield className="h-4 w-4 text-gray-500" />
                                            <span>User ID:</span>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                                {userData.userInfo.id}
                                            </code>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Shield className="h-4 w-4 text-gray-500" />
                                            <span>Primary Email ID:</span>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                                {userData.userInfo.primaryEmailAddressId}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Public Metadata */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Public Metadata</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-gray-500" />
                                            <span>Role</span>
                                        </div>
                                        <Badge className={`${getRoleBadge(userData.userInfo.publicMetadata.role || 'user')} rounded-full`}>
                                            {getRoleIcon(userData.userInfo.publicMetadata.role)}
                                            {userData.userInfo.publicMetadata.role || 'User'}
                                        </Badge>

                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-gray-500" />
                                            <span>Status</span>
                                        </div>
                                        <Badge 
                                            className={`${getStatusColor(userData.userInfo.publicMetadata.status || 'active')} rounded-full`}
                                        >
                                            {userData.userInfo.publicMetadata.status === 'active' ? (
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                            ) : (
                                                <XCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {userData.userInfo.publicMetadata.status || 'Active'}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* Private Metadata */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Private Metadata</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-gray-500" />
                                            <span>Blocked</span>
                                        </div>
                                        <Badge 
                                            variant={userData.userInfo.privateMetadata.blocked ? 'destructive' : 'default'}
                                            className="rounded-full"
                                        >
                                            {userData.userInfo.privateMetadata.blocked ? (
                                                <Ban className="h-3 w-3 mr-1" />
                                            ) : (
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {userData.userInfo.privateMetadata.blocked ? 'Blocked' : 'Active'}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* Financial Information */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Financial Information</p>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">Total Spent: ₹{userData.totalSpent}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Section */}
                <Card className="lg:col-span-2 bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 h-fit">
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>Recent orders and their status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-fit">
                        {userData.orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Orders Yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    This user hasn&#39;t placed any orders yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userData.orders.map((order) => (
                                    <Card key={order.order_id} className="bg-gray-50 dark:bg-gray-900/50">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Order #{order.order_id}</p>
                                                    <p className="text-xs text-gray-500">Ordered on {formatOrderDate(order.created_at)}</p>
                                                    {order.estimated_delivery_date && (
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                            Estimated delivery: {formatOrderDate(order.estimated_delivery_date)}
                                                        </p>
                                                    )}
                                                    {order.delivery_status.toLowerCase() === "delivered" && order.delivered_date && (
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                                            Delivered on {formatOrderDate(order.delivered_date)}
                                                        </p>
                                                    )}
                                                    {order.tracking_number && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            Tracking: {order.tracking_number}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`${getStatusColor(order.payment_status || '')} rounded-full px-3 py-1 w-fit`}
                                                    >
                                                        {getPaymentStatusIcon(order.payment_status || '')}
                                                        <span className="ml-1.5">{capitalizeFirstLetter(order.payment_status)}</span>
                                                    </Badge>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`${getStatusColor(order.delivery_status || '')} rounded-full px-3 py-1 w-fit`}
                                                    >
                                                        {getDeliveryStatusIcon(order.delivery_status || '')}
                                                        <span className="ml-1.5">{order.delivery_status}</span>
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleOrderExpand(order.order_id)}
                                                        className="h-8 w-8 flex-shrink-0"
                                                    >
                                                        {expandedOrders.has(order.order_id) ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                            {expandedOrders.has(order.order_id) && (
                                                <>
                                                    {order.shipping_address && (
                                                        <div className="mb-4">
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Shipping Address</p>
                                                            <p className="text-sm mt-1">{order.shipping_address}</p>
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        {(order.items || []).map((item) => (
                                                            <div key={item.book_id} className="flex items-center justify-between text-sm">
                                                                <div>
                                                                    <p className="font-medium">{item.title}</p>
                                                                    <p className="text-gray-500">by {item.author}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p>₹{item.price_at_time} x {item.quantity}</p>
                                                                    <p className="font-medium">₹{item.subtotal}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Separator className="my-3" />
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm text-gray-500">Total</p>
                                                        <p className="font-semibold">₹{order.total_spent}</p>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default UserProfile

