import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "@/lib/db";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await pool.connect();
        
        const query = `
            SELECT 
                o.id,
                o.payment_status,
                o.tracking_number,
                o.delivery_status,
                o.shipping_address,
                o.created_at,
                o.estimated_delivery_date,
                o.is_reviewed,
                json_agg(
                    json_build_object(
                        'id', oi.id,
                        'book_id', oi.book_id,
                        'quantity', oi.quantity,
                        'price_at_time', oi.price_at_time,
                        'title', b.title,
                        'authors', COALESCE(b.authors, '{}'),
                        'thumbnail', b.thumbnail
                    )
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE o.user_id = $1 AND o.payment_status = 'completed'
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;

        const result = await client.query(query, [userId]);
        
        type OrderItem = {
            id: number | null;
            book_id: number;
            quantity: number;
            price_at_time: number;
            title: string;
            authors: string[];
            thumbnail: string;
        };

        const orders = result.rows.map(order => ({
            ...order,
            items: (order.items as OrderItem[]).filter((item) => item.id !== null)
        }));

        client.release();
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ 
            error: "Error fetching orders",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}