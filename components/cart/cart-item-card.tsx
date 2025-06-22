"use client"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface CartItem {
    id: string
    title: string
    authors: string | string[]
    thumbnail?: string
    originalPrice: number
    discount: number
    quantity: number
}

interface CartCardProps {
    item: CartItem
    onQuantityChange: (id: string, newQuantity: number) => void
    onRemove: (id: string) => void
}

export function CartCard({ item, onQuantityChange, onRemove }: CartCardProps) {
    const [isRemoving, setIsRemoving] = useState(false)

    // Helper function to format authors
    const formatAuthors = (authors: string | string[]): string => {
        if (Array.isArray(authors)) {
            return authors.join(", ")
        }
        return authors
    }

    // Calculate prices
    const buyingPrice = Math.floor(item.originalPrice - item.originalPrice * (item.discount / 100))
    const savingPrice = Math.floor(item.originalPrice * (item.discount / 100))
    const totalSavings = savingPrice * item.quantity
    const totalPrice = buyingPrice * item.quantity

    const handleQuantityDecrease = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.id, item.quantity - 1)
        }
    }

    const handleQuantityIncrease = () => {
        onQuantityChange(item.id, item.quantity + 1)
    }

    const handleRemove = () => {
        setIsRemoving(true)
        setTimeout(() => {
            onRemove(item.id)
        }, 300)
    }

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-all duration-300 ${
                isRemoving ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100 translate-x-0"
            }`}
        >
            {/* Mobile Layout (< sm) */}
            <div className="block sm:hidden">
                <div className="flex gap-3 mb-3">
                    {/* Book Image */}
                    <div className="relative w-12 h-16 sm:w-14 sm:h-18 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <Image
                            src={item.thumbnail || "/placeholder.svg?height=120&width=80"}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                        />
                        {/* Discount Badge */}
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full shadow-sm">
                            {item.discount}%
                        </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                    by {formatAuthors(item.authors)}
                                </p>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={handleRemove}
                                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full flex-shrink-0"
                                title="Remove from cart"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Price Information - Mobile */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500 dark:text-gray-400 line-through">₹{item.originalPrice}</span>
                                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{buyingPrice}</span>
                                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Save ₹{savingPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Section */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Qty:</span>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                                onClick={handleQuantityDecrease}
                                disabled={item.quantity <= 1}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-lg"
                            >
                                <Minus className="w-3 h-3" />
                            </button>

                            <span className="px-2 py-1 text-sm font-medium bg-gray-50 dark:bg-gray-700 min-w-[32px] text-center">
                                {item.quantity}
                            </span>

                            <button
                                onClick={handleQuantityIncrease}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-r-lg"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                        <div className="font-bold text-base text-gray-900 dark:text-gray-100">₹{totalPrice}</div>
                        {totalSavings > 0 && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">Save ₹{totalSavings}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tablet and Desktop Layout (>= sm) */}
            <div className="hidden sm:block">
                <div className="flex gap-4">
                    {/* Book Image */}
                    <div className="relative w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <Image
                            src={item.thumbnail || "/placeholder.svg?height=120&width=80"}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 64px, (max-width: 1024px) 80px, 96px"
                        />
                        {/* Discount Badge */}
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            {item.discount}%
                        </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-semibold text-sm md:text-base lg:text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    by {formatAuthors(item.authors)}
                                </p>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={handleRemove}
                                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                title="Remove from cart"
                            >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ₹{item.originalPrice}
                                </span>
                                <span className="font-bold text-sm md:text-base lg:text-lg text-emerald-600 dark:text-emerald-400">
                                    ₹{buyingPrice}
                                </span>
                                <span className="text-xs md:text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                    Save ₹{savingPrice}
                                </span>
                            </div>

                            {/* Total for multiple items */}
                            {item.quantity > 1 && (
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Total: <span className="font-semibold text-gray-900 dark:text-gray-100">₹{totalPrice}</span>
                                    {totalSavings > 0 && (
                                        <span className="text-emerald-600 dark:text-emerald-400 ml-1">(Save ₹{totalSavings})</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Qty:</span>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <button
                                        onClick={handleQuantityDecrease}
                                        disabled={item.quantity <= 1}
                                        className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-lg"
                                    >
                                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>

                                    <span className="px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base font-medium bg-gray-50 dark:bg-gray-700 min-w-[40px] md:min-w-[48px] text-center">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={handleQuantityIncrease}
                                        className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-r-lg"
                                    >
                                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Item Total Price */}
                            <div className="text-right">
                                <div className="font-bold text-base md:text-lg lg:text-xl text-gray-900 dark:text-gray-100">
                                    ₹{totalPrice}
                                </div>
                                {totalSavings > 0 && (
                                    <div className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400">
                                        You save ₹{totalSavings}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
