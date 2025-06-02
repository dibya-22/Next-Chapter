import React from 'react'
import AdminNav from './components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {


    return (
        <div className="flex min-h-[calc(100vh-11vh)] mt-[11vh] bg-[#F5F5DC] text-[#2B2B2B] dark:bg-[#2B2B2B] dark:text-[#F5F5DC]">
            <aside className={`w-64 h-[calc(100vh-15vh)] p-6 my-4 fixed left-0 top-[11vh] bg-gray-100 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-r-3xl`}>
                <AdminNav />
            </aside>
            <main className="w-screen mx-auto pl-5 py-3">
                {children}
            </main>
        </div>
    )
}