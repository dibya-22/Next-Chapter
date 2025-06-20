import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
    const client = await pool.connect();
    const { userId } = await auth();

    if (!userId) {
        console.log("No userId found in auth");
        return NextResponse.json({ error: "No user ID found" }, { status: 401 });
    }

    if (userId !== process.env.ADMIN_USER_ID) {
        console.log("User is not admin");
        return NextResponse.json({ error: "Not authorized as admin" }, { status: 401 });
    }

    try {
        // Get pagination params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const offset = (page - 1) * limit;

        // Get total count
        const totalResult = await client.query("SELECT COUNT(*) FROM orders WHERE payment_status='completed';");
        const total = parseInt(totalResult.rows[0].count, 10);

        // Fetch paginated orders with calculated total amount
        const ordersResult = await client.query(
            `SELECT 
                o.*,
                COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_amount
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.payment_status = 'completed'
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2;`,
            [limit, offset]
        );
        console.log(ordersResult);

        return NextResponse.json({ orders: ordersResult.rows, total }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    } finally {
        client.release();
    }
}