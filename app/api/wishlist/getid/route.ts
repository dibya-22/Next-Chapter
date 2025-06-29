import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const bookId = searchParams.get('bookId');

        if (!bookId) {
            return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
        }

        const client = await pool.connect();
        
        const query = `
            SELECT EXISTS(
                SELECT 1 FROM wishlists 
                WHERE user_id = $1 AND book_id = $2
            ) as exists
        `;
        
        const result = await client.query(query, [userId, parseInt(bookId)]);
        client.release();
        
        return NextResponse.json({ exists: result.rows[0].exists });
    } catch (error) {
        console.error("Error checking wishlist:", error);
        return NextResponse.json({ 
            error: "Error checking wishlist",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
