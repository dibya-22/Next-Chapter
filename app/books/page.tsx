/*
Book Headings
    - Search Results for "{search}"
    - Best Sellers
    - Top Rated Books
    - Some Categories
    - New Arrivals
*/
"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image';
import { Star, StarHalf, Users, Eye, ShoppingCart } from "lucide-react";
import { Book, Categories, BookType } from '@/lib/types';
import { getBooksFromDB } from '@/app/api/books/route';

const Books = () => {
    const searchParams = useSearchParams();
    const search = searchParams.get('search');
    const [rating, setRating] = useState<number>(1.7);

    // get books
    const [searchResultsBooks, setSearchResultsBooks] = useState<Book[]>([]);
    const [bestSellersBooks, setBestSellersBooks] = useState<Book[]>([]);
    const [topRatedBooks, setTopRatedBooks] = useState<Book[]>([]);
    const [categoriesBooks, setCategoriesBooks] = useState<Categories>({
        fiction: [],
        nonFiction: [],
        selfHelp: [],
        business: []
    });
    const [newArrivalsBooks, setNewArrivalsBooks] = useState<Book[]>([]);

    const getBooks = async() => {
        if(search){
            setSearchResultsBooks(await getBooksFromDB(0, BookType.SEARCH_RESULTS, search));
        }

        setBestSellersBooks(await getBooksFromDB(6, BookType.BEST_SELLERS));
        setTopRatedBooks(await getBooksFromDB(6, BookType.TOP_RATED));
        setNewArrivalsBooks(await getBooksFromDB(6, BookType.NEW_ARRIVALS));
    }
    

    useEffect(() => {

    },[])


    return (
        <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-0 md:mx-auto mt-[11vh]'>
            {!!search && <h1 className='text-3xl font-bold mb-4'>Search Results for "{search}"</h1>}
            {/* Book Card */}
            <div
                className="book w-[250px] h-[420px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center p-4 rounded-2xl cursor-pointer group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative border border-gray-200/50 dark:border-gray-700/50"
            >
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                    20% OFF
                </div>

                {/* Book Cover Container */}
                <div className="img-container relative w-[180px] h-[260px] mb-3 transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                    <Image
                        src="https://books.google.com/books/content?id=CbouDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs-api"
                        alt="Ikigai book cover"
                        fill
                        className="object-cover rounded-xl"
                        priority
                        sizes="180px"
                    />
                </div>

                {/* Book Info */}
                <div className="info w-full text-center flex flex-col items-center gap-2 flex-1">
                    <div className="title-author flex flex-col items-center mb-2">
                        <h3 className="title font-bold text-lg text-gray-900 dark:text-gray-50 line-clamp-2 leading-tight">
                            Ikigai: The Japanese Secret to a Long and Happy Life
                        </h3>

                        <p className="author font-medium text-sm text-gray-600 dark:text-gray-300">by Francesc Miralles</p>
                    </div>

                    {/* Rating Section */}
                    <div className="rating flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {

                                const filled = star <= Math.floor(rating);
                                const halfFilled = star === Math.ceil(rating) && !Number.isInteger(rating);

                                return halfFilled ? (
                                    <StarHalf
                                        key={star}
                                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                    />
                                ) : (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${filled
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                                            }`}
                                    />
                                );
                            })}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating < 0 ? "0" : rating > 5 ? "5" : rating}</span>
                    </div>

                    {/* Reviews Count */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <Users className="w-3 h-3" />
                        <span>2,847 reviews</span>
                    </div>

                    {/* Price Section */}
                    <div className="price-section flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="original-price text-sm text-gray-500 dark:text-gray-400 line-through">₹ 625</span>
                            <span className="current-price font-bold text-xl text-emerald-600 dark:text-emerald-400">₹ 499</span>
                        </div>
                        <span className="savings text-xs text-emerald-700 dark:text-emerald-300 font-medium">You save ₹ 126</span>
                    </div>
                </div>

                {/* Enhanced Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl flex flex-col items-center justify-end pb-8">
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 flex flex-col gap-3">
                        <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                            <Eye className="w-4 h-4 mr-2 inline-block" />
                            View Details
                        </button>
                        <button className="bg-white/90 hover:bg-white text-gray-900 px-8 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm backdrop-blur-sm">
                            <ShoppingCart className="w-4 h-4 mr-2 inline-block" />
                            Add to Cart
                        </button>
                    </div>
                </div>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
            </div>
        </div>
    )
}

export default Books