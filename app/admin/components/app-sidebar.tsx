"use client"
import type * as React from "react"
import { usePathname } from "next/navigation"
import { ChartBarBig, Users, Package2, Book, BookPlus, GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items
const items = [
    { title: "Dashboard", url: "/admin/dashboard", icon: ChartBarBig },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Orders", url: "/admin/orders", icon: Package2 },
    { title: "Books", url: "/admin/books", icon: Book },
    { title: "Add Book", url: "/admin/add-book", icon: BookPlus },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    
    return (
        <Sidebar {...props} className="h-[calc(100vh-11vh)] w-[240px] border-r border-gray-200 dark:border-gray-800 bg-[#F5F5DC] dark:bg-[#2B2B2B] mt-[11vh]">
            <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 ">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/admin" className="flex items-center gap-3">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-[0.5rem] bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Admin Panel</span>
                                    <span className="text-xs">Management</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="p-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="mb-2">Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild
                                        isActive={pathname === item.url}
                                        className={cn(
                                            "transition-all duration-200 w-full",
                                            pathname === item.url && [
                                                "shadow-lg scale-[1.02]",
                                                "bg-[#E6E6D1] dark:bg-[#3B3B3B]",
                                                "hover:bg-[#D6D6C1] dark:hover:bg-[#4B4B4B]",
                                                "text-[#2B2B2B] dark:text-[#F5F5DC]"
                                            ]
                                        )}
                                    >
                                        <a href={item.url} className="flex items-center gap-3">
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
