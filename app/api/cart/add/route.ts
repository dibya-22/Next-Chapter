import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { auth } from "@clerk/nextjs/server";
import { CartItem } from "@/lib/types";

interface PostgresError extends Error {
    code?: string;
}

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json(
            { error: "Please log in to add items to your cart." },
            { status: 401 }
        );
    }

    try {
        const client = await pool.connect();
        const { id, title, authors, thumbnail, originalPrice, discount, quantity } = await request.json() as CartItem;

        // Check if item already exists in cart
        const checkQuery = `
            SELECT * FROM cart 
            WHERE user_id = $1 AND book_id = $2
        `;
        const existingItem = await client.query(checkQuery, [userId, parseInt(id)]);

        if (existingItem.rows.length > 0) {
            // Update quantity if item exists
            const updateQuery = `
                UPDATE cart 
                SET quantity = quantity + $1
                WHERE user_id = $2 AND book_id = $3
                RETURNING *
            `;
            const result = await client.query(updateQuery, [quantity, userId, parseInt(id)]);
            client.release();
            return new NextResponse(JSON.stringify(result.rows[0]), { status: 200 });
        }

        // Insert new item if it doesn't exist
        const insertQuery = `
            INSERT INTO cart (
                user_id, 
                book_id, 
                title, 
                authors, 
                thumbnail, 
                original_price, 
                discount, 
                quantity
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const result = await client.query(insertQuery, [
            userId,
            parseInt(id),
            title,
            Array.isArray(authors) ? authors : [authors],
            thumbnail,
            originalPrice,
            discount,
            quantity
        ]);

        client.release();
        return new NextResponse(JSON.stringify(result.rows[0]), { status: 201 });

    } catch (error) {
        console.error('Error adding to cart:', error);
        const pgError = error as PostgresError;
        if (pgError.code === '23503') { // Foreign key violation
            return new NextResponse("Book not found", { status: 404 });
        }
        return new NextResponse("Error adding item to cart", { status: 500 });
    }
}