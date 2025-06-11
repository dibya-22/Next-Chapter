import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "@/lib/db";

export async function PUT(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, trackingNumber, deliveryStatus } = await request.json();
        
        if (!orderId || !trackingNumber || !deliveryStatus) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await pool.connect();
        
        const updateQuery = `
            UPDATE orders 
            SET 
                tracking_number = $1,
                delivery_status = $2,
                updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            RETURNING *
        `;

        const result = await client.query(updateQuery, [
            trackingNumber,
            deliveryStatus,
            orderId,
            userId
        ]);

        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating order tracking:", error);
        return NextResponse.json({ 
            error: "Error updating order tracking",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 