"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { toast } from "react-toastify"

interface BookReviewProps {
    orderId: number
    bookId: number
    onReviewSubmitted?: () => void
    className?: string
}

interface Review {
    book_id: number
    rating: number
    created_at: string
}

export default function BookReview({ 
    orderId, 
    bookId, 
    onReviewSubmitted,
    className 
}: BookReviewProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isReviewed, setIsReviewed] = useState(false)

    useEffect(() => {
        const fetchExistingReview = async () => {
            try {
                const response = await fetch(`/api/orders/review?orderId=${orderId}`)
                if (response.ok) {
                    const reviews = await response.json()
                    const review = reviews.find((r: Review) => r.book_id === bookId)
                    if (review) {
                        setRating(review.rating)
                        setIsReviewed(true)
                    }
                }
            } catch (error) {
                console.error("Error fetching existing review:", error)
            }
        }

        fetchExistingReview()
    }, [orderId, bookId])

    const handleRatingClick = (star: number) => {
        if (!isReviewed) {
            setRating(star)
        }
    }

    const handleSubmit = async () => {
        if (rating === 0 || isReviewed) return

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/orders/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    bookId,
                    rating
                })
            })

            if (response.ok) {
                setIsReviewed(true)
                toast.success("Review submitted successfully!")
                onReviewSubmitted?.()
            } else {
                const error = await response.json()
                toast.error(error.error || "Failed to submit review")
            }
        } catch (error) {
            console.error("Error submitting review:", error)
            toast.error("Failed to submit review")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {isReviewed ? (
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        You rated this {rating}/5
                    </span>
                </div>
            ) : (
                <>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => handleRatingClick(star)}
                            >
                                <Star
                                    className={`w-6 h-6 transition-colors ${star <= (hoveredRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300 hover:text-yellow-400"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={rating === 0 || isSubmitting} 
                        size="sm"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </>
            )}
        </div>
    )
} 