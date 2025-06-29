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

    if (wishlistItems.length === 0) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28'>
                <SectionHeader title="My Wishlist" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    {/* Heart Icon */}
                    <div className="mb-6 sm:mb-8">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <svg 
                                className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 dark:text-red-400" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                            Your Wishlist is Empty
                        </h1>
                        
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Start building your reading collection by adding books you love to your wishlist.
                        </p>

                        {/* Features List */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Why create a wishlist?
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Save books for later purchase
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Get notified about price drops
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Organize your reading goals
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Share with friends and family
                                </li>
                            </ul>
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-3 sm:space-y-4">
                            <Link 
                                href="/books" 
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Browse Books
                            </Link>
                            
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                                Click the heart icon on any book to add it to your wishlist
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
