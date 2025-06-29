import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request: Request) {
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

        // Remove book from wishlist
        const deleteQuery = `
            DELETE FROM wishlists 
            WHERE user_id = $1 AND book_id = $2
            RETURNING id
        `;
        
        const result = await client.query(deleteQuery, [userId, parseInt(bookId)]);
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Book not found in wishlist" }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: "Book removed from wishlist" 
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return NextResponse.json({ 
            error: "Error removing from wishlist",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 