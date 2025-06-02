'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <ul className="flex flex-col items-center gap-5 my-10">
            <li className='w-[80%]'>
                <Link 
                    href="/admin/dashboard" 
                    className={`bg-gray-200 dark:bg-[#2B2B2B] block w-full text-center py-2 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 ${pathname === '/admin/dashboard' ? 'shadow-[4px_4px_10px_rgba(0,0,0,0.6),_-4px_-4px_10px_rgba(255,255,255,0.1)]' : 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'}`}
                >Dashboard</Link>
            </li>
            <li className='w-[80%]'>
                <Link 
                    href="/admin/books" 
                    className={`bg-gray-200 dark:bg-[#2B2B2B] block w-full text-center py-2 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 ${pathname === '/admin/books' ? 'shadow-[4px_4px_10px_rgba(0,0,0,0.6),_-4px_-4px_10px_rgba(255,255,255,0.1)]' : 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'}`}
                >Books</Link>
            </li>
            <li className='w-[80%]'>
                <Link 
                    href="/admin/add-book" 
                    className={`bg-gray-200 dark:bg-[#2B2B2B] block w-full text-center py-2 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 ${pathname === '/admin/add-book' ? 'shadow-[4px_4px_10px_rgba(0,0,0,0.6),_-4px_-4px_10px_rgba(255,255,255,0.1)]' : 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'}`}
                >Add Book</Link>
            </li>
        </ul>
    )
}