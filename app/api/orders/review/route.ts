import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, bookId, rating } = await request.json();

        if (!orderId || !bookId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }

        const client = await pool.connect();

        // Start transaction
        await client.query('BEGIN');

        try {
            // Check if user has purchased this book in this order
            const orderCheckQuery = `
                SELECT oi.id, o.delivery_status, o.is_reviewed
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.order_id = $1 AND oi.book_id = $2 AND o.user_id = $3
            `;
            
            const orderCheckResult = await client.query(orderCheckQuery, [orderId, bookId, userId]);
            
            if (orderCheckResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: "Order item not found or unauthorized" }, { status: 404 });
            }

            const orderItem = orderCheckResult.rows[0];
            
            if (orderItem.delivery_status !== 'Delivered') {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: "Can only review delivered items" }, { status: 400 });
            }

            // Check if review already exists
            const existingReviewQuery = `
                SELECT id FROM reviews 
                WHERE order_id = $1 AND book_id = $2 AND user_id = $3
            `;
            
            const existingReviewResult = await client.query(existingReviewQuery, [orderId, bookId, userId]);
            
            if (existingReviewResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: "Review already exists for this book" }, { status: 400 });
            }

            // Insert the review
            const insertReviewQuery = `
                INSERT INTO reviews (order_id, book_id, user_id, rating, created_at)
                VALUES ($1, $2, $3, $4, NOW())
            `;
            
            await client.query(insertReviewQuery, [orderId, bookId, userId, rating]);

            // Update book rating and rating count
            const updateBookQuery = `
                UPDATE books 
                SET 
                    rating = (
                        SELECT ROUND(AVG(rating)::numeric, 1)
                        FROM reviews 
                        WHERE book_id = $1
                    ),
                    rating_count = (
                        SELECT COUNT(*)
                        FROM reviews 
                        WHERE book_id = $1
                    )
                WHERE id = $1
            `;
            
            await client.query(updateBookQuery, [bookId]);

            // Check if all books in this order have been reviewed
            const allBooksReviewedQuery = `
                SELECT 
                    COUNT(DISTINCT oi.book_id) as total_books,
                    COUNT(DISTINCT r.book_id) as reviewed_books
                FROM order_items oi
                LEFT JOIN reviews r ON oi.order_id = r.order_id AND oi.book_id = r.book_id
                WHERE oi.order_id = $1
            `;
            
            const reviewStatusResult = await client.query(allBooksReviewedQuery, [orderId]);
            const { total_books, reviewed_books } = reviewStatusResult.rows[0];

            // If all books are reviewed, mark order as reviewed
            if (parseInt(total_books) === parseInt(reviewed_books)) {
                const updateOrderQuery = `
                    UPDATE orders 
                    SET is_reviewed = true 
                    WHERE id = $1
                `;
                await client.query(updateOrderQuery, [orderId]);
            }

            await client.query('COMMIT');

            return NextResponse.json({ 
                message: "Review submitted successfully",
                orderReviewed: parseInt(total_books) === parseInt(reviewed_books)
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Error submitting review:", error);
        return NextResponse.json({ 
            error: "Error submitting review",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    try {
        const client = await pool.connect();
        
        const query = `
            SELECT r.book_id, r.rating, r.created_at
            FROM reviews r
            JOIN orders o ON r.order_id = o.id
            WHERE r.order_id = $1 AND o.user_id = $2
        `;

        const result = await client.query(query, [orderId, userId]);
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ 
            error: "Error fetching reviews",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 