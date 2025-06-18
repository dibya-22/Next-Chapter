import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bookId, quantity } = await request.json();
        if (!bookId || !quantity) {
            return NextResponse.json({ error: "Missing bookId or quantity" }, { status: 400 });
        }

        const result = await pool.query(
            "UPDATE cart SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND book_id = $3 RETURNING *",
            [quantity, userId, bookId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json({ error: "Error updating cart item" }, { status: 500 });
    }
} 