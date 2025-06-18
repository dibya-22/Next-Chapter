import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(
    request: NextRequest,
    context: { params: { userId: string } }
) {
    const client = await pool.connect();
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
        console.log("No userId found in auth");
        return NextResponse.json({ error: "No user ID found" }, { status: 401 });
    }

    if (currentUserId !== process.env.ADMIN_USER_ID) {
        console.log("User is not admin");
        return NextResponse.json({ error: "Not authorized as admin" }, { status: 401 });
    }

    try {
        const requestedUserId = context.params.userId;

        if (!requestedUserId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const clerk = await clerkClient();
        const user = await clerk.users.getUser(requestedUserId);

        const userInfo = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            emailAddresses: user.emailAddresses,
            primaryEmailAddressId: user.primaryEmailAddressId,
            imageUrl: user.imageUrl,
            publicMetadata: user.publicMetadata,
            privateMetadata: user.privateMetadata,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastSignInAt: user.lastSignInAt,
        };

        const ordersQuery = `
      WITH order_totals AS (
        SELECT 
          o.id as order_id,
          o.created_at,
          o.delivered_date,
          o.estimated_delivery_date,
          o.payment_status,
          o.delivery_status,
          o.tracking_number,
          o.shipping_address,
          SUM(oi.quantity * oi.price_at_time) as total_spent
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.id, o.created_at, o.delivered_date, o.estimated_delivery_date, 
                 o.payment_status, o.delivery_status, o.tracking_number, o.shipping_address
      )
      SELECT 
        ot.*,
        json_agg(
          json_build_object(
            'book_id', b.id,
            'title', b.title,
            'author', b.authors,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'subtotal', oi.quantity * oi.price_at_time
          )
        ) as items
      FROM order_totals ot
      LEFT JOIN order_items oi ON ot.order_id = oi.order_id
      LEFT JOIN books b ON oi.book_id = b.id
      GROUP BY ot.order_id, ot.created_at, ot.delivered_date, ot.estimated_delivery_date,
               ot.payment_status, ot.delivery_status, ot.tracking_number, ot.shipping_address, ot.total_spent
      ORDER BY ot.created_at DESC
    `;

        const ordersResult = await client.query(ordersQuery, [requestedUserId]);
        const orders = ordersResult.rows;

        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_spent), 0);

        return NextResponse.json({
            userInfo,
            orders,
            totalSpent: totalSpent.toFixed(2)
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    } finally {
        client.release();
    }
}
