import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bookId } = await request.json();
        if (!bookId) {
            return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
        }

        const result = await pool.query(
            "DELETE FROM cart WHERE user_id = $1 AND book_id = $2 RETURNING *",
            [userId, bookId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        return NextResponse.json({ error: "Error removing item from cart" }, { status: 500 });
    }
} 