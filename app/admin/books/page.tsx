'use client'
import { useState } from 'react'
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function BooksPage() {

    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }

    const handleSubmit = (e: React.FormEvent, searchType: string) => {
        e.preventDefault();
        console.log('Search Query:', searchQuery, '\nSearch Type:', searchType);
        setSearchQuery('');
        setDropdownOpen(false);
        // Here you can add logic to handle the search query, like fetching books from an API
    }

    return (
        <div className="h-[calc(100vh-14vh)] flex flex-col items-center ">
            <h1 className='text-3xl font-bold my-10 underline'>Manage Books</h1>
            <form className='flex items-center gap-5'>
                <input
                    value={searchQuery}
                    onChange={(e) => handleChange(e)}
                    type="text"
                    id="search"
                    name="search"
                    className="w-[30vw] px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 dark:focus:ring-white focus:border-gray-500"   
                    placeholder="Search for books..."
                    required
                />

                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger disabled={!searchQuery} className='bg-slate-50 hover:bg-[#e9e9e3] text-[#2B2B2B] dark:bg-[#4b4848] dark:hover:bg-[#575555] dark:text-[#F5F5DC] px-5 py-2  transform transition-all active:scale-110 cursor-pointer disabled:cursor-not-allowed'>
                        Search By
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='bg-slate-50 dark:bg-[#4b4848] dark:text-[#F5F5DC] p-2'>
                        <DropdownMenuItem onClick={(e) => handleSubmit(e, 'title')} className='bg-slate-50 hover:bg-[#e9e9e3] text-[#2B2B2B] dark:bg-[#4b4848] dark:hover:bg-[#575555] dark:text-[#F5F5DC] cursor-pointer'>
                            Title
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleSubmit(e, 'author')} className='bg-slate-50 hover:bg-[#e9e9e3] text-[#2B2B2B] dark:bg-[#4b4848] dark:hover:bg-[#575555] dark:text-[#F5F5DC] cursor-pointer'>
                            Author
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleSubmit(e, 'isbn')} className='bg-slate-50 hover:bg-[#e9e9e3] text-[#2B2B2B] dark:bg-[#4b4848] dark:hover:bg-[#575555] dark:text-[#F5F5DC] cursor-pointer'>
                            ISBN
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleSubmit(e, 'category')} className='bg-slate-50 hover:bg-[#e9e9e3] text-[#2B2B2B] dark:bg-[#4b4848] dark:hover:bg-[#575555] dark:text-[#F5F5DC] cursor-pointer'>
                            Category
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </form>
        </div>
    )
}