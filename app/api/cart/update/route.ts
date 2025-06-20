import { NextRequest } from "next/server"
import pool from "@/lib/db"
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: Request) {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    try {
        const { id, quantity } = await request.json();
        const client = await pool.connect();

        const query = `
            UPDATE cart 
            SET quantity = $1
            WHERE user_id = $2 AND book_id = $3
            RETURNING *
        `;
        
        const result = await client.query(query, [quantity, userId, parseInt(id)]);
        client.release();

        if (result.rows.length === 0) {
            return new Response("Item not found in cart", { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
        console.error('Error updating cart:', error);
        return new Response("Error updating cart item", { status: 500 });
    }
} 