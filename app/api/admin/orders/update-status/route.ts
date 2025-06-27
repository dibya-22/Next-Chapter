import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

interface OrderStatusUpdate {
    orderId: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

interface OrderRecord {
    id: string;
    delivery_status: string;
    payment_status: string;
    delivered_date: string | null;
    updated_at: string;
    is_reviewed: boolean;
}

/**
 * * Format: NC-ORD-YYYYMMDD-XXXXXX
 * 
 * ? Breakdown:
 * * NC      → Next Chapter (your brand)
 * * ORD     → Stands for Order
 * * YYYYMMDD → Date the tracking number was generated (e.g. 20250627)
 * * XXXXXX  → Random alphanumeric string (secure & unique)
 * 
 * TODO: Ensure this is called only when status === 'hipped'
 */
function generateTrackingNumber() {
    const brand = "NC";
    const type = "ORD";
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${brand}-${type}-${dateStr}-${rand}`;
}

export async function POST(request: Request) {
    const client = await pool.connect();
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "No user ID found" }, { status: 401 });
    }
    if (userId !== process.env.ADMIN_USER_ID) {
        return NextResponse.json({ error: "Not authorized as admin" }, { status: 401 });
    }

    try {
        const { orderId, status }: OrderStatusUpdate = await request.json();
        if (!orderId || !status) {
            return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
        }

        let updateQuery = '';
        let params: string[] = [];

        if (status === 'Delivered') {
            updateQuery = `UPDATE orders SET delivery_status = $1, delivered_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`;
            params = [status, orderId];
            const result = await client.query(updateQuery, params);
            if (result.rows.length === 0) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }
            await client.query(
                `UPDATE books
                    SET total_sold = total_sold + oi.quantity
                    FROM order_items oi
                    WHERE books.id = oi.book_id AND oi.order_id = $1`,
                [orderId]
            );
            const updatedOrder: OrderRecord = result.rows[0];
            return NextResponse.json(updatedOrder);
        } else if (status === 'Cancelled') {
            try {
                await client.query('BEGIN');
                // Update order
                const orderResult = await client.query(
                    `UPDATE orders SET delivery_status = $1, payment_status = 'refunded', tracking_number = NULL, updated_at = NOW() WHERE id = $2 RETURNING *`,
                    [status, orderId]
                );
                // Update payment(s) for this order
                await client.query(
                    `UPDATE payments SET status = 'refunded', updated_at = NOW() WHERE order_id = $1`,
                    [orderId]
                );
                await client.query('COMMIT');
                if (orderResult.rows.length === 0) {
                    return NextResponse.json({ error: "Order not found" }, { status: 404 });
                }
                const updatedOrder: OrderRecord = orderResult.rows[0];
                return NextResponse.json(updatedOrder);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error("Error updating order and payment status:", err);
                return NextResponse.json({ error: "Internal server error" }, { status: 500 });
            }
        } else if (status === 'Shipped') {
            // Set tracking number when shipped
            const trackingNumber = generateTrackingNumber();
            updateQuery = `UPDATE orders SET delivery_status = $1, tracking_number = $2, updated_at = NOW() WHERE id = $3 RETURNING *`;
            params = [status, trackingNumber, orderId];
        } else {
            updateQuery = `UPDATE orders SET delivery_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
            params = [status, orderId];
        }

        if (updateQuery) {
            const result = await client.query(updateQuery, params);
            if (result.rows.length === 0) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }
            const updatedOrder: OrderRecord = result.rows[0];
            return NextResponse.json(updatedOrder);
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        client.release();
    }
} 