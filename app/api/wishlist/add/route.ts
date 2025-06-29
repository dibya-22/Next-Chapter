import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bookId } = await request.json();

        if (!bookId) {
            return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
        }

        const client = await pool.connect();

        // Check if book already exists in wishlist
        const checkQuery = `
            SELECT id FROM wishlists 
            WHERE user_id = $1 AND book_id = $2
        `;
        const existingItem = await client.query(checkQuery, [userId, parseInt(bookId)]);

        if (existingItem.rows.length > 0) {
            client.release();
            return NextResponse.json({ error: "Book already in wishlist" }, { status: 409 });
        }

        // Add book to wishlist
        const insertQuery = `
            INSERT INTO wishlists (user_id, book_id, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id
        `;
        
        const result = await client.query(insertQuery, [userId, parseInt(bookId)]);
        client.release();
        
        return NextResponse.json({ 
            success: true, 
            message: "Book added to wishlist",
            id: result.rows[0].id 
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return NextResponse.json({ 
            error: "Error adding to wishlist",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 