"use client";
import React, { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/books/book-card';
import { SectionHeader } from '@/components/section-header';
import { WishlistSkeleton } from '@/components/wishlist/wishlist-skeleton';
import { X } from 'lucide-react';
import Link from 'next/link';
import type { Book } from '@/lib/types';

interface WishlistItem {
    id: number;
    book_id: number;
    created_at: string;
    title: string;
    authors: string[];
    description: string;
    thumbnail: string;
    isbn: string;
    price: number;
    discount: number;
    stock: number;
    category: string;
    total_sold: number;
    rating: number;
    rating_count: number;
    pages: number;
}

const Wishlist = () => {
    const { isLoaded, isSignedIn } = useUser();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/wishlist");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setWishlistItems(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch wishlist');
        } finally {
            setLoading(false);
        }
    }

    const removeFromWishlist = (bookId: number) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.book_id !== bookId));
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchWishlist();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || loading) {
        return <WishlistSkeleton />;
    }

    if (!isSignedIn) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-full max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col items-center justify-center gap-4 min-h-[50vh]'>
                <h1 className='text-xl sm:text-2xl font-bold text-center'>Please Sign In</h1>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center'>You need to be signed in to view your wishlist.</p>
                <SignInButton mode="modal">
                    <Button variant="custom">Sign In</Button>
                </SignInButton>
            </div>
        );
    }

    if (error) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28'>
                <SectionHeader title="My Wishlist" />
                <div className="text-center py-12">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <button 
                        onClick={fetchWishlist}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Filter wishlist items based on search query
    const filteredItems = wishlistItems.filter(item => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const authorsString = Array.isArray(item.authors) ? item.authors.join(', ') : String(item.authors);
        return (
            item.title.toLowerCase().includes(query) ||
            authorsString.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
    });

    

    return (
        <div className='font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28'>
            <div className="wishlist-container space-y-4 sm:space-y-6 lg:space-y-8 mb-6 sm:mb-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <SectionHeader title="My Wishlist" />
                    <div className="relative w-full sm:w-auto">
                        <Input
                            placeholder="Search wishlist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-3 pr-10 w-full sm:w-64 rounded-[0.5rem] placeholder:text-gray-500 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white"
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
                </div>

                {searchQuery && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[0.5rem]">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Showing {filteredItems.length} of {wishlistItems.length} items matching &quot;{searchQuery}&quot;
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    {filteredItems.map((item) => {
                        // Convert WishlistItem to Book type
                        const book: Book = {
                            id: item.book_id,
                            title: item.title,
                            authors: item.authors,
                            description: item.description,
                            thumbnail: item.thumbnail,
                            isbn: item.isbn,
                            price: item.price,
                            discount: item.discount,
                            stock: item.stock,
                            category: item.category,
                            total_sold: item.total_sold,
                            rating: item.rating,
                            rating_count: item.rating_count,
                            pages: item.pages,
                            created_at: new Date(item.created_at)
                        };
                        return (
                            <div key={item.id} className="relative">
                                <BookCard 
                                    book={book} 
                                    onWishlistToggle={(isInWishlist: boolean) => {
                                        if (!isInWishlist) {
                                            removeFromWishlist(item.book_id);
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Wishlist
