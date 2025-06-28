"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, UserCog, Shield, UserIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import Link from "next/link"

interface User {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    username: string | null
    imageUrl: string
    createdAt: Date
    lastSignInAt: Date | null
    role: "admin" | "user"
    status: "active" | "blocked"
}

interface ApiResponse {
    users: User[]
}

const Users = () => {
    const [users, setUsers] = useState<User[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const itemsPerPage = 10

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/admin/users/get-users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data: ApiResponse = await response.json()

            if (!Array.isArray(data.users)) {
                console.error("Invalid response format:", data)
                return { error: "Invalid response format" }
            }

            setUsers(data.users)
        } catch (error) {
            console.error("Error fetching users:", error)
            return { error: "Failed to fetch users" }
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (user: User) => {
        setSelectedUser(user)
        setShowConfirmDialog(true)
    }

    const confirmStatusUpdate = async () => {
        if (!selectedUser) return

        try {
            const newStatus = selectedUser.status === "active" ? "blocked" : "active"
            const response = await fetch("/api/admin/users/update-user-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    isDisabled: newStatus === "blocked"
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update user status")
            }

            toast.success(data.message)
            
            // Update local state
            setUsers(prevUsers => {
                if (!prevUsers) return null
                return prevUsers.map(user => 
                    user.id === selectedUser.id 
                        ? { ...user, status: newStatus }
                        : user
                )
            })
        } catch (error) {
            console.error("Error updating user status:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update user status")
        } finally {
            setShowConfirmDialog(false)
            setSelectedUser(null)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
            case "banned":
            case "blocked":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
            case "locked":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
            case "pending":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };


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

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return <Shield className="h-3 w-3 mr-1" />
            case "user":
                return <UserIcon className="h-3 w-3 mr-1" />
            default:
                return null
        }
    }

    function truncateId(id: string, start = 6, end = 4): string {
        if (id.length <= start + end) return id
        return `${id.slice(0, start)}...${id.slice(-end)}`
    }

    function formatDate(date: Date | null): string {
        if (!date) return "Never"
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentUsers = users?.slice(startIndex, endIndex)

    // Filter users based on search query
    const filteredUsers = users?.filter(user => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            String(user.id).toLowerCase().includes(query) ||
            String(user.email).toLowerCase().includes(query) ||
            String(user.username || '').toLowerCase().includes(query) ||
            String(user.role).toLowerCase().includes(query) ||
            String(user.status).toLowerCase().includes(query) ||
            String(user.firstName || '').toLowerCase().includes(query) ||
            String(user.lastName || '').toLowerCase().includes(query)
        );
    }) || [];

    // Pagination for filtered results
    const filteredTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const filteredStartIndex = (currentPage - 1) * itemsPerPage;
    const filteredEndIndex = filteredStartIndex + itemsPerPage;
    const paginatedUsers = searchQuery ? filteredUsers.slice(filteredStartIndex, filteredEndIndex) : currentUsers;

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    }

    if (loading) {
        return (
            <div className="w-full max-w-screen-xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
                <Card className="overflow-x-auto border-border">
                    <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 border-b">
                        <h1 className="text-xl sm:text-2xl font-bold">Users</h1>
                        <Button variant="outline" size="sm" className="rounded-[0.5rem]" disabled>
                            Refresh
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <ScrollArea className="w-full min-w-[900px]">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px] text-center">ID</TableHead>
                                        <TableHead className="w-[250px] text-center">User</TableHead>
                                        <TableHead className="w-[200px] text-center">Email</TableHead>
                                        <TableHead className="w-[150px] text-center">Username</TableHead>
                                        <TableHead className="w-[150px] text-center">Role</TableHead>
                                        <TableHead className="w-[150px] text-center">Status</TableHead>
                                        <TableHead className="w-[150px] text-center">Last Sign In</TableHead>
                                        <TableHead className="w-[80px] text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Skeleton className="h-9 w-9 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-24" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-4 w-32 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-4 w-20 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-4 w-24 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-8 w-8 mx-auto rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </Card>
            </div>
        )
    }

    if (!users || users.length === 0) {
        return (
            <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8">
                <Card>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No users found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                There are no users in the system or an error occurred while fetching.
                            </p>
                            <Button onClick={() => fetchUsers()} className="mt-4" variant="outline">
                                Retry
                            </Button>
                        </div>
                    </CardContent>
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
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-[#F5F5DC] dark:bg-[#2B2B2B] border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedUser?.status === "active" ? "Block User" : "Activate User"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to {selectedUser?.status === "active" ? "block" : "activate"} {selectedUser?.firstName || selectedUser?.username || "this user"}? 
                            {selectedUser?.status === "active" 
                                ? " They will not be able to access the platform until unblocked." 
                                : " They will regain access to the platform."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmStatusUpdate}
                            className={selectedUser?.status === "active" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                        >
                            {selectedUser?.status === "active" ? "Block User" : "Activate User"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="overflow-x-auto border-border">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b gap-4 sm:gap-0">
                    <h1 className="text-xl sm:text-2xl font-bold">Users</h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-3 pr-10 w-full sm:w-64 rounded-[0.5rem]"
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
                        <Button onClick={() => { fetchUsers() }} variant="outline" size="sm" className="rounded-[0.5rem]">
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <ScrollArea className="w-full min-w-[900px]">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px] text-center">ID</TableHead>
                                    <TableHead className="w-[250px] text-center">User</TableHead>
                                    <TableHead className="w-[200px] text-center">Email</TableHead>
                                    <TableHead className="w-[150px] text-center">Username</TableHead>
                                    <TableHead className="w-[150px] text-center">Role</TableHead>
                                    <TableHead className="w-[150px] text-center">Status</TableHead>
                                    <TableHead className="w-[150px] text-center">Last Sign In</TableHead>
                                    <TableHead className="w-[80px] text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers?.map((user) => (
                                    <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors">
                                        <TableCell onClick={() => copyToClipboard(user.id)} className="font-mono text-xs text-muted-foreground text-center transform active:scale-95 cursor-pointer" title={user.id}>
                                            {truncateId(user.id)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="relative h-9 w-9 overflow-hidden rounded-full border bg-muted/20">
                                                    <Image
                                                        src={user.imageUrl || "/placeholder.svg?height=36&width=36"}
                                                        alt={`${user.firstName || ""} ${user.lastName || ""}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium leading-none">
                                                        {user.firstName || user.username || "Unnamed"} {user.lastName || ""}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground mt-1">Created {formatDate(user.createdAt)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={() => copyToClipboard(user.email)} className="max-w-[200px] truncate text-center transform active:scale-95 cursor-pointer" title={user.email}>
                                            {user.email || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-center">{user.username || "N/A"}</TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`${getRoleBadge(user.role)} inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                            >
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`${getStatusColor(user.status)} inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                            >
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground text-center">
                                            {formatDate(user.lastSignInAt)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white dark:bg-[#2B2B2B] z-50">
                                                        <DropdownMenuItem>Edit user</DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer"><Link href={`/admin/users/${user.id}`}>View details</Link></DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className={`
                                                                ${user.status === "active"
                                                                    ? "text-rose-600 dark:text-rose-400"
                                                                    : "text-emerald-600 dark:text-emerald-400"}
                                                                cursor-pointer
                                                            `}
                                                            onClick={() => handleStatusUpdate(user)}
                                                        >
                                                            {user.status === "active" ? "Block user" : "Activate user"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t gap-2 md:gap-0">
                    <div className="text-sm text-muted-foreground mb-2 md:mb-0">
                        {searchQuery ? (
                            `Showing ${filteredUsers.length} of ${users?.length || 0} users (filtered)`
                        ) : (
                            `Showing ${startIndex + 1} to ${Math.min(endIndex, users?.length || 0)} of ${users?.length || 0} users`
                        )}
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
                            {Array.from({ length: searchQuery ? filteredTotalPages : Math.ceil((users?.length || 0) / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                            disabled={currentPage === (searchQuery ? filteredTotalPages : Math.ceil((users?.length || 0) / itemsPerPage))}
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

export default Users
