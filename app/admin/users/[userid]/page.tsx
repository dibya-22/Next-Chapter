"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    Bell,
    Package,
    CreditCard,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    ArrowLeft,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

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
    payment_status: string
    delivery_status: string
    total_spent: number
    items: OrderItem[]
}

interface UserInfo {
    id: string
    firstName: string | null
    lastName: string | null
    username: string | null
    emailAddresses: { emailAddress: string }[]
    imageUrl: string
    createdAt: string
    lastSignInAt: string | null
    publicMetadata: {
        role?: string
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

const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return 'default'
        case 'pending':
            return 'secondary'
        case 'processing':
            return 'secondary'
        case 'delivered':
            return 'default'
        case 'cancelled':
            return 'destructive'
        default:
            return 'secondary'
    }
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

const getPaymentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case "completed":
            return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        case "failed":
            return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        default:
            return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
}

const UserProfile = () => {
    const params = useParams()
    const userId = params.userid as string
    const [userData, setUserData] = useState<UserData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchUserData = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
            case "completed":
            case "delivered":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
            case "banned":
            case "blocked":
            case "cancelled":
            case "failed":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
            case "locked":
            case "processing":
            case "shipped":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            case "pending":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const getRoleBadge = (role: string) => {
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
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleUserAction = async (action: string) => {
        setActionLoading(action)
        try {
            const response = await fetch(`/api/admin/users/${userId}/actions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action }),
            })

            if (response.ok) {
                // Refresh user data
                fetchUserData(userId)
            }
        } catch (error) {
            console.error("Error performing action:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleOrderStatusUpdate = async (orderId: string, status: string) => {
        setActionLoading(`order-${orderId}`)
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: status }),
            })

            if (response.ok) {
                // Refresh user data
                fetchUserData(userId)
            }
        } catch (error) {
            console.error("Error updating order status:", error)
        } finally {
            setActionLoading(null)
        }
    }

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

    const { userInfo, orders, totalSpent } = userData
    const role = userInfo.publicMetadata?.role || 'user'
    const isBlocked = userInfo.privateMetadata?.blocked || false

    return (
        <div className="min-h-screen bg-[#F5F5DC] dark:bg-[#2b2b2b]">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Back Button - Mobile First */}
                <div className="flex items-center space-x-4 mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back to Users</span>
                    </Button>
                </div>

                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0 ring-2 ring-white/50 dark:ring-gray-600">
                            <AvatarImage src={userInfo.imageUrl || "/placeholder.svg"} alt={userInfo.firstName || "User"} />
                            <AvatarFallback className="text-lg sm:text-xl bg-white/80 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {userInfo.firstName?.[0]}
                                {userInfo.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {userInfo.firstName} {userInfo.lastName}
                            </h1>
                            <p className="text-gray-700 dark:text-gray-300">@{userInfo.username}</p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                <Badge className={getRoleBadge(role)}>
                                    {getRoleIcon(role)}
                                    {role}
                                </Badge>
                                {isBlocked && (
                                    <Badge variant="destructive">Blocked</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={actionLoading !== null}
                                className="bg-white/80 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 bg-white/95 dark:bg-gray-800/95 border-gray-300 dark:border-gray-600"
                        >
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUserAction("promote")}>
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction("demote")}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                Demote to User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUserAction("activate")}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate Account
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Ban User
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-4 sm:mx-0 bg-white/95 dark:bg-gray-800/95 border-gray-300 dark:border-gray-600">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will ban the user and prevent them from accessing the platform. This action can be reversed
                                            later.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleUserAction("ban")}>Ban User</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUserAction("notify")}>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Notification
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600">
                        <TabsTrigger
                            value="overview"
                            className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="orders"
                            className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                        >
                            Orders ({orders.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="activity"
                            className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                        >
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Stats Cards - Responsive Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Spent</CardTitle>
                                    <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalSpent}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Orders</CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{orders.length}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg col-span-2 lg:col-span-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Account Created
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(userInfo.createdAt)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg col-span-2 lg:col-span-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Sign In</CardTitle>
                                    <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                        {userInfo.lastSignInAt ? formatDate(userInfo.lastSignInAt) : "Never"}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Details */}
                        <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-gray-100">User Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                                        <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{userInfo.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                        <p className="text-gray-900 dark:text-gray-100">{userInfo.username || "Not set"}</p>
                                    </div>
                                </div>

                                <Separator className="bg-gray-300 dark:bg-gray-600" />

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Email Addresses
                                    </label>
                                    <div className="space-y-2">
                                        {userInfo.emailAddresses.map((email, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-[0.5rem] bg-gray-50/80 dark:bg-gray-700/50 space-y-2 sm:space-y-0"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                                    <span className="text-gray-900 dark:text-gray-100 break-all">{email.emailAddress}</span>
                                                    {index === 0 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs w-fit bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                        >
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="default"
                                                    className="text-xs w-fit bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                >
                                                    Verified
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                        {orders.length === 0 ? (
                            <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <ShoppingBag className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Orders Found</h3>
                                        <p className="text-gray-700 dark:text-gray-300">This user hasn't placed any orders yet.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Card
                                        key={order.order_id}
                                        className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg"
                                    >
                                        <CardHeader>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                <div>
                                                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                                        Order #{order.order_id}
                                                    </CardTitle>
                                                    <CardDescription className="text-gray-700 dark:text-gray-300">
                                                        {formatOrderDate(order.created_at)}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                                    <Badge className={getStatusVariant(order.payment_status)}>
                                                        <Truck className="h-3 w-3 mr-1" />
                                                        {order.payment_status}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={actionLoading === `order-${order.order_id}`}
                                                                className="w-full sm:w-auto bg-white/80 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600"
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                                <span className="ml-2 sm:hidden">Update Status</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="bg-white/95 dark:bg-gray-800/95 border-gray-300 dark:border-gray-600"
                                                        >
                                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleOrderStatusUpdate(order.order_id, "processing")}>
                                                                Processing
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOrderStatusUpdate(order.order_id, "shipped")}>
                                                                Shipped
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOrderStatusUpdate(order.order_id, "delivered")}>
                                                                Delivered
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOrderStatusUpdate(order.order_id, "cancelled")}>
                                                                Cancelled
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                    <div className="flex items-center space-x-2">
                                                        {getPaymentStatusIcon(order.payment_status)}
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">Status: {order.payment_status}</span>
                                                    </div>
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        ₹{order.total_spent}
                                                    </div>
                                                </div>

                                                <Separator className="bg-gray-300 dark:bg-gray-600" />

                                                <div className="space-y-2">
                                                    <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                                                        <Package className="h-4 w-4 mr-2" />
                                                        Items ({order.items.length})
                                                    </h4>
                                                    {order.items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50/80 dark:bg-gray-700/50 rounded space-y-2 sm:space-y-0"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">by {item.author}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">₹{item.subtotal}</p>
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                    Qty: {item.quantity} × ₹{item.price_at_time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card className="bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
                                <CardDescription className="text-gray-700 dark:text-gray-300">
                                    User activity and account changes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 dark:text-gray-100">Account created</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300">{formatDate(userInfo.createdAt)}</p>
                                        </div>
                                    </div>
                                    {userInfo.lastSignInAt && (
                                        <div className="flex items-start space-x-4">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 dark:text-gray-100">Last sign in</p>
                                                <p className="text-xs text-gray-700 dark:text-gray-300">{formatDate(userInfo.lastSignInAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {orders.map((order) => (
                                        <div key={order.order_id} className="flex items-start space-x-4">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 dark:text-gray-100">Order #{order.order_id} placed</p>
                                                <p className="text-xs text-gray-700 dark:text-gray-300">{formatOrderDate(order.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default UserProfile
