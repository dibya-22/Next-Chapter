"use client"
import type React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);
    const currentPage = segments[segments.length - 1] || 'dashboard';
    const formattedPage = currentPage
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="fixed inset-0 mt-[11vh] bg-[#F5F5DC] text-[#2B2B2B] dark:bg-[#2B2B2B] dark:text-[#F5F5DC] w-full" suppressHydrationWarning>
            <SidebarProvider>
                <div className="flex h-[calc(100vh-11vh)] w-full">
                    <AppSidebar />
                    <SidebarInset className="flex flex-col flex-1 w-full">
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-r border-gray-300 dark:border-gray-700 pl-4">
                            <SidebarTrigger className="-ml-1" suppressHydrationWarning />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{formattedPage}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </header>
                        <main className="flex-1 overflow-y-auto w-full">
                            <div className="h-full p-4 w-full">
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    )
}
