"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface ReviewComponentProps {
    onSubmit?: (rating: number) => void
    onRatingChange?: (rating: number) => void
    className?: string
}

export default function ReviewComponent({ onSubmit, onRatingChange, className }: ReviewComponentProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)

    const handleRatingClick = (star: number) => {
        setRating(star)
        onRatingChange?.(star)
    }

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit?.(rating)
        }
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
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

            <Button onClick={handleSubmit} disabled={rating === 0} size="sm">
                Submit
            </Button>
        </div>
    )
}
