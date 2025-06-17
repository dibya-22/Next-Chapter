import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

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
        const { orderId, newStatus } = await request.json();
        if (!orderId || !newStatus) {
            return NextResponse.json({ error: "Missing orderId or newStatus" }, { status: 400 });
        }

        let updateQuery = '';
        let params: any[] = [];
        if (newStatus === 'Delivered') {
            updateQuery = `UPDATE orders SET delivery_status = $1, delivered_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`;
            params = [newStatus, orderId];
        } else {
            updateQuery = `UPDATE orders SET delivery_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
            params = [newStatus, orderId];
        }

        const result = await client.query(updateQuery, params);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, order: result.rows[0] });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    } finally {
        client.release();
    }
} 