import { NextResponse } from "next/server";
import pool from "@/lib/db"
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await pool.connect();
        const query = `
            SELECT 
                book_id as id,
                title,
                authors,
                thumbnail,
                original_price as "originalPrice",
                discount,
                quantity
            FROM cart 
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await client.query(query, [userId]);
        client.release();
        
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json({ error: "Error fetching cart items" }, { status: 500 });
    }
}