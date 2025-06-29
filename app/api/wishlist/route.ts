import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await pool.connect();
        
        const query = `
            SELECT 
                w.id,
                w.book_id,
                w.created_at,
                b.title,
                b.authors,
                b.description,
                b.thumbnail,
                b.isbn,
                b.price,
                b.discount,
                b.stock,
                b.category,
                b.total_sold,
                b.rating,
                b.rating_count,
                b.pages
            FROM wishlists w
            JOIN books b ON w.book_id = b.id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
        `;
        
        const result = await client.query(query, [userId]);
        client.release();
        console.log(result);
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return NextResponse.json({ 
            error: "Error fetching wishlist items",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
