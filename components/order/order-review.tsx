"use client"

import BookReview from "./book-review"

interface OrderItem {
    id: number;
    book_id: number;
    title: string;
    authors?: string[];
    thumbnail: string;
    quantity: number;
    price_at_time: number;
}

interface OrderReviewProps {
    orderId: number
    items: OrderItem[]
    onReviewSubmitted?: () => void
    className?: string
}

export default function OrderReview({
    orderId, 
    items, 
    onReviewSubmitted,
    className 
}: OrderReviewProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-base sm:text-lg font-bold mb-3">Review Your Books</h3>
            <div className="grid gap-4">
                {items.map((item) => (
                    <BookReview
                        key={item.book_id}
                        orderId={orderId}
                        bookId={item.book_id}
                        onReviewSubmitted={onReviewSubmitted}
                    />
                ))}
            </div>
        </div>
    )
} 