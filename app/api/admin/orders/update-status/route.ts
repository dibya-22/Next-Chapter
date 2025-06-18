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
        } else if (status === 'Cancelled') {
            updateQuery = `UPDATE orders SET delivery_status = $1, payment_status = 'refunded', updated_at = NOW() WHERE id = $2 RETURNING *`;
            params = [status, orderId];
        } else {
            updateQuery = `UPDATE orders SET delivery_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
            params = [status, orderId];
        }

        const result = await client.query(updateQuery, params);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const updatedOrder: OrderRecord = result.rows[0];
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        client.release();
    }
} 