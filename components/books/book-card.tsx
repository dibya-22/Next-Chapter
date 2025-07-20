"use client"
import Image from "next/image"
import type React from "react"
import { Star, StarHalf, Users, Eye, ShoppingCart, BookOpen, Check, Heart } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { Book } from "@/lib/types"
import { useUser } from "@clerk/nextjs"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

interface BookCardProps {
    book: Book
    onWishlistToggle?: (isInWishlist: boolean) => void
}

export function BookCard({ book, onWishlistToggle }: BookCardProps) {
    const { isSignedIn } = useUser();
    const [isExpanded, setIsExpanded] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [isAdded, setIsAdded] = useState(false)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const router = useRouter();

    const checkWishlistStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/wishlist/getid?bookId=${book.id}`);
            if (response.ok) {
                const data = await response.json();
                setIsInWishlist(data.exists);
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    }, [book.id]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isSignedIn) {
            // TODO: Show sign-in prompt
            return;
        }

        if (isTogglingWishlist) return;

        setIsTogglingWishlist(true);

        try {
            const url = isInWishlist ? '/api/wishlist/remove' : '/api/wishlist/add';
            const method = isInWishlist ? 'DELETE' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookId: book.id })
            });

            if (response.ok) {
                const newWishlistStatus = !isInWishlist;
                setIsInWishlist(newWishlistStatus);
                // Notify parent component about wishlist status change
                onWishlistToggle?.(newWishlistStatus);
            } else {
                console.error('Error toggling wishlist:', response.statusText);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    // Check if book is in wishlist on component mount
    useEffect(() => {
        if (isSignedIn) {
            checkWishlistStatus();
        }
    }, [isSignedIn, checkWishlistStatus]);

    // Helper function to format authors
    const formatAuthors = (authors: string | string[]): string => {
        if (Array.isArray(authors)) {
            return authors.join(", ")
        }
        return authors
    }

    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsExpanded(true)
    }

    const handleCollapse = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsExpanded(false)
    }

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isAddingToCart || isAdded) return

        if (!isSignedIn) {
                toast.error("Please log in to add items to your cart.");
                router.push("https://present-krill-46.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fbooks");
                return;
            }

        setIsAddingToCart(true)

        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: book.id,
                    title: book.title,
                    authors: book.authors,
                    thumbnail: book.thumbnail,
                    originalPrice: book.price,
                    discount: book.discount,
                    quantity: 1
                })
            });
            

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            // After successful addition
            setIsAddingToCart(false)
            setIsAdded(true)

            // Reset after showing "Added"
            setTimeout(() => {
                setIsAdded(false)
            }, 1500)
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsAddingToCart(false)
            // You might want to show an error message to the user
        }
    }

    // Handle click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node) && isExpanded) {
                setIsExpanded(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isExpanded])

    const discountedPrice = Math.floor(book.price - book.price * (book.discount / 100))
    const savings = Math.floor(book.price * (book.discount / 100))

    return (
        <div
            ref={cardRef}
            className={`book relative mx-auto h-auto sm:h-[420px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex cursor-pointer group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden ${isExpanded
                ? "w-full max-w-full sm:max-w-[580px] col-span-2 sm:col-span-2 lg:col-span-2"
                : "w-full max-w-[280px] flex-col items-center p-3 sm:p-4"
                }`}
            style={isExpanded ? { gridColumn: "span 2" } : {}}
        >
            {/* Discount Badge */}
            <div
                className={`absolute top-2 sm:top-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg ${isExpanded ? "left-2 sm:left-3" : "right-2 sm:right-3"
                    }`}
            >
                {book.discount}% OFF
            </div>

            {/* Heart Icon for Wishlist */}
            <div
                className={`absolute top-2 sm:top-3 z-10 ${isExpanded ? "right-2 sm:right-3" : "left-2 sm:left-3"}`}
            >
                <button
                    className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                    onClick={toggleWishlist}
                    disabled={isTogglingWishlist}
                >
                    <Heart className={`w-4 h-4 transition-colors duration-300 ${isInWishlist
                            ? "text-red-500 fill-red-500 dark:text-red-400 dark:fill-red-400"
                            : "text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
                        } ${isTogglingWishlist ? 'animate-pulse' : ''}`} />
                </button>
            </div>

            {isExpanded ? (
                // Expanded Layout - Horizontal on larger screens, vertical on mobile
                <div className="flex flex-col sm:flex-row w-full h-full">
                    {/* Left Side - Image */}
                    <div className="w-full sm:w-[200px] h-[200px] sm:h-full flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                        <Image
                            src={book.thumbnail || "/placeholder.svg?height=400&width=300"}
                            alt={book.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 640px) 100vw, 200px"
                        />
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                        {/* Top Section - Title, Author, Description */}
                        <div className="space-y-2 sm:space-y-3">
                            <div>
                                <h3 className="title font-bold text-base sm:text-lg text-gray-900 dark:text-gray-50 leading-tight mb-1">
                                    {book.title}
                                </h3>
                                <p className="author font-medium text-xs sm:text-sm text-gray-600 dark:text-gray-300">by {formatAuthors(book.authors)}</p>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                                {book.description}
                            </p>

                            {/* Pages Info */}
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <BookOpen className="w-3 h-3" />
                                <span>{book.pages} pages</span>
                            </div>
                        </div>

                        {/* Middle Section - Rating and Reviews */}
                        <div className="space-y-2 my-2 sm:my-3">
                            <div className="rating flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                    {(() => {
                                        const stars = [];
                                        const rating = Math.max(0, Math.min(5, Number(book.rating)));
                                        const fullStars = Math.floor(rating);
                                        const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
                                        for (let i = 1; i <= 5; i++) {
                                            if (i <= fullStars) {
                                                stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
                                            } else if (i === fullStars + 1 && hasHalfStar) {
                                                stars.push(<StarHalf key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
                                            } else {
                                                stars.push(<Star key={i} className="w-3 h-3 fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600" />);
                                            }
                                        }
                                        return stars;
                                    })()}
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {book.rating < 0 ? "0" : book.rating > 5 ? "5" : Number(book.rating).toFixed(1).replace(/\.0$/, "")}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Users className="w-3 h-3" />
                                <span>{book.rating_count} reviews</span>
                            </div>
                        </div>

                        {/* Bottom Section - Price and Actions */}
                        <div className="space-y-2 sm:space-y-3">
                            <div className="price-section">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="original-price text-xs text-gray-500 dark:text-gray-400 line-through">
                                        ₹ {book.price}
                                    </span>
                                    <span className="current-price font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
                                        ₹ {discountedPrice}
                                    </span>
                                </div>
                                <span className="savings text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                                    You save ₹ {savings}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddToCart}
                                    className={`bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex items-center gap-1 flex-1 relative overflow-hidden ${isAddingToCart || isAdded ? "pointer-events-none" : ""}`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-full transition-all duration-500 ${isAddingToCart ? "translate-x-[120%]" : isAdded ? "translate-x-0" : "translate-x-0"}`}
                                    >
                                        <ShoppingCart className={`w-3 h-3 ${isAddingToCart ? "mr-0" : "mr-1"}`} />
                                        <span>{isAdded ? "Added" : "Add to Cart"}</span>
                                    </div>
                                    {isAddingToCart && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShoppingCart className="w-3 h-3 animate-[cartRide_1s_ease-in-out]" />
                                        </div>
                                    )}
                                    {isAdded && <Check className="w-3 h-3 mr-1" />}
                                </button>
                                <button
                                    onClick={handleCollapse}
                                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-2 rounded-full font-medium transition-all duration-300 text-xs"
                                >
                                    Collapse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Normal Layout - Vertical
                <>
                    {/* Book Cover Container */}
                    <div className="img-container relative w-[120px] sm:w-[140px] md:w-[180px] h-[160px] sm:h-[180px] md:h-[240px] mb-3 transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                        <Image
                            src={book.thumbnail || "/placeholder.svg?height=400&width=300"}
                            alt={book.title}
                            fill
                            className="object-cover rounded-xl"
                            priority
                            sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 180px"
                        />
                    </div>

                    {/* Book Info */}
                    <div className="info w-full text-center flex flex-col items-center gap-2 flex-1">
                        <div className="title-author flex flex-col items-center mb-2">
                            <h3 className="title font-bold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-gray-50 line-clamp-2 leading-tight px-2">
                                {book.title}
                            </h3>
                            <p className="author font-medium text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-2">by {formatAuthors(book.authors)}</p>
                        </div>

                        {/* Rating Section */}
                        <div className="rating flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-0.5">
                                {(() => {
                                    const stars = [];
                                    const rating = Math.max(0, Math.min(5, Number(book.rating)));
                                    const fullStars = Math.floor(rating);
                                    const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
                                    for (let i = 1; i <= 5; i++) {
                                        if (i <= fullStars) {
                                            stars.push(<Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />);
                                        } else if (i === fullStars + 1 && hasHalfStar) {
                                            stars.push(<StarHalf key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />);
                                        } else {
                                            stars.push(<Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600" />);
                                        }
                                    }
                                    return stars;
                                })()}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {book.rating < 0 ? "0" : book.rating > 5 ? "5" : Number(book.rating).toFixed(1).replace(/\.0$/, "")}
                            </span>
                        </div>

                        {/* Reviews Count */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <Users className="w-3 h-3" />
                            <span>{book.rating_count} reviews</span>
                        </div>

                        {/* Price Section */}
                        <div className="price-section flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <span className="original-price text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ₹ {book.price}
                                </span>
                                <span className="current-price font-bold text-sm sm:text-base lg:text-lg xl:text-xl text-emerald-600 dark:text-emerald-400">
                                    ₹ {discountedPrice}
                                </span>
                            </div>
                            <span className="savings text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                                You save ₹ {savings}
                            </span>
                        </div>
                    </div>

                    {/* Enhanced Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl flex flex-col items-center justify-end pb-6 sm:pb-8">
                        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 flex flex-col gap-2 sm:gap-3">
                            <button
                                onClick={handleViewDetails}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                            >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline-block" />
                                View Details
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className={`bg-white/90 hover:bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm backdrop-blur-sm relative overflow-hidden ${isAddingToCart || isAdded ? "pointer-events-none" : ""}`}
                            >
                                <div
                                    className={`flex items-center justify-center w-full transition-all duration-500 ${isAddingToCart ? "translate-x-[120%]" : isAdded ? "translate-x-0" : "translate-x-0"}`}
                                >
                                    <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 ${isAddingToCart ? "mr-0" : "mr-1 sm:mr-2 inline-block"}`} />
                                    <span>{isAdded ? "Added" : "Add to Cart"}</span>
                                </div>
                                {isAddingToCart && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 animate-[cartRide_1s_ease-in-out]" />
                                    </div>
                                )}
                                {isAdded && <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline-block" />}
                            </button>
                        </div>
                    </div>

                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
                </>
            )}
        </div>
    )
}
