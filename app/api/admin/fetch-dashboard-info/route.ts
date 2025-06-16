import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";


export async function GET() {
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
        // Count total users and active users
        let totalUsers = 0;
        let activeUsers = 0;
        let blockedUsers = 0;
        let offset = 0;
        const limit = 100;
        while (true) {
            const clerk = await clerkClient();
            const users = await clerk.users.getUserList({ limit, offset });
            if (!users.data.length) break;

            totalUsers += users.data.length;

            // Add detailed logging for each user
            users.data.forEach(user => {
                console.log("User metadata check:", {
                    userId: user.id,
                    disabled: user.privateMetadata?.disabled,
                    blocked: user.privateMetadata?.blocked,
                    isActive: !user.privateMetadata?.disabled && !user.privateMetadata?.blocked
                });
            });

            // Count users that are not disabled and not blocked
            activeUsers += users.data.filter(user => !user.privateMetadata?.disabled && !user.privateMetadata?.blocked).length;
            // Count users that are blocked
            blockedUsers += users.data.filter(user => user.privateMetadata?.blocked).length;

            offset += limit;
        }

        console.log("Clerk Users Data:", { totalUsers, activeUsers, blockedUsers });

        // Fetch total payments from the database
        const payments = await client.query(
            "SELECT COALESCE(SUM(amount), 0) as total_revenue, COALESCE(COUNT(*), 0) as total_payments FROM payments WHERE status = 'completed'"
        );
        const monthlyPayments = await client.query(
            "SELECT COALESCE(SUM(amount), 0) as monthly_revenue FROM payments WHERE status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())"
        );

        console.log("Payments Data:", payments.rows[0]);

        //Order Data
        const orders = await client.query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN payment_status = 'completed' AND delivery_status = 'Delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE 
                    WHEN payment_status = 'completed' 
                    AND delivery_status NOT IN ('Delivered', 'Cancelled')
                    THEN 1 
                END) as pending_orders,
                COUNT(CASE WHEN delivery_status = 'Cancelled' THEN 1 END) as cancelled_orders
            FROM orders 
            WHERE payment_status = 'completed'
        `);

        console.log("Orders Data:", {
            total: orders.rows[0]?.total_orders,
            delivered: orders.rows[0]?.delivered_orders,
            processing: orders.rows[0]?.processing_orders,
            cancelled: orders.rows[0]?.cancelled_orders
        });

        // Book Data
        const books = await client.query(`
            SELECT
                COUNT(*) as total_books,
                COALESCE(SUM(total_sold), 0) as total_sold,
                COALESCE(SUM(stock), 0) as total_stock,
                COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
                COUNT(DISTINCT category) as total_categories
            FROM books
        `);

        const response = {
            totalUsers,
            activeUsers,
            blockedUsers,
            totalRevenue: Number(payments.rows[0]?.total_revenue || 0),
            totalPayments: Number(payments.rows[0]?.total_payments || 0),
            monthlyRevenue: Number(monthlyPayments.rows[0]?.monthly_revenue || 0),
            totalOrders: Number(orders.rows[0]?.total_orders || 0),
            deliveredOrders: Number(orders.rows[0]?.delivered_orders || 0),
            pendingOrders: Number(orders.rows[0]?.pending_orders || 0),
            cancelledOrders: Number(orders.rows[0]?.cancelled_orders || 0),
            totalBooks: Number(books.rows[0]?.total_books || 0),
            totalSold: Number(books.rows[0]?.total_sold || 0),
            totalStock: Number(books.rows[0]?.total_stock || 0),
            outOfStock: Number(books.rows[0]?.out_of_stock || 0),
            totalCategories: Number(books.rows[0]?.total_categories || 0),
        };

        console.log("Final Response:", response);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching dashboard info:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard info" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
