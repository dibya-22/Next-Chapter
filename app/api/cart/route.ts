import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await pool.connect();
        const query = `
            SELECT c.*, b.* 
            FROM cart c
            JOIN books b ON c.book_id = b.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `;
        
        const result = await client.query(query, [userId]);
        client.release();
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json({ error: "Error fetching cart items" }, { status: 500 });
    }
}