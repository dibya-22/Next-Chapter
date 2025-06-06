import { NextRequest } from "next/server"
import pool from "@/lib/db"
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request: Request) {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    try {
        const { id } = await request.json();
        const client = await pool.connect();

        const query = `
            DELETE FROM cart 
            WHERE user_id = $1 AND book_id = $2
            RETURNING *
        `;
        
        const result = await client.query(query, [userId, parseInt(id)]);
        client.release();

        if (result.rows.length === 0) {
            return new Response("Item not found in cart", { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
        console.error('Error removing from cart:', error);
        return new Response("Error removing cart item", { status: 500 });
    }
} 