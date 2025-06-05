import Image from "next/image"
import { Star, StarHalf, Users, Eye, ShoppingCart } from "lucide-react"
import type { Book } from "@/lib/types"

interface BookCardProps {
    book: Book
}

export function BookCard({ book }: BookCardProps) {
    return (
        <div className="book w-full max-w-[280px] mx-auto h-[420px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center p-4 rounded-2xl cursor-pointer group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative border border-gray-200/50 dark:border-gray-700/50">
            {/* Discount Badge */}
            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                {book.discount}% OFF
            </div>

            {/* Book Cover Container */}
            <div className="img-container relative w-full max-w-[180px] aspect-[3/4] mb-3 transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <Image
                    src={book.thumbnail || ""}
                    alt={book.title}
                    fill
                    className="object-cover rounded-xl"
                    priority
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
            </div>

            {/* Book Info */}
            <div className="info w-full text-center flex flex-col items-center gap-2 flex-1">
                <div className="title-author flex flex-col items-center mb-2">
                    <h3 className="title font-bold text-base sm:text-lg text-gray-900 dark:text-gray-50 line-clamp-2 leading-tight px-2">
                        {book.title}
                    </h3>
                    <p className="author font-medium text-sm text-gray-600 dark:text-gray-300 px-2">by {book.authors}</p>
                </div>

                {/* Rating Section */}
                <div className="rating flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const filled = star <= Math.floor(book.rating)
                            const halfFilled = star === Math.ceil(book.rating) && !Number.isInteger(book.rating)

                            return halfFilled ? (
                                <StarHalf key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${filled
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                                        }`}
                                />
                            )
                        })}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {book.rating < 0 ? "0" : book.rating > 5 ? "5" : book.rating}
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
                        <span className="original-price text-sm text-gray-500 dark:text-gray-400 line-through">₹ {book.price}</span>
                        <span className="current-price font-bold text-lg sm:text-xl text-emerald-600 dark:text-emerald-400">
                            ₹ {Math.floor(book.price - book.price * (book.discount / 100))}
                        </span>
                    </div>
                    <span className="savings text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                        You save ₹ {Math.floor(book.price * (book.discount / 100))}
                    </span>
                </div>
            </div>

            {/* Enhanced Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl flex flex-col items-center justify-end pb-8">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 flex flex-col gap-3">
                    <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                        <Eye className="w-4 h-4 mr-2 inline-block" />
                        View Details
                    </button>
                    <button className="bg-white/90 hover:bg-white text-gray-900 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm backdrop-blur-sm">
                        <ShoppingCart className="w-4 h-4 mr-2 inline-block" />
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
        </div>
    )
}
