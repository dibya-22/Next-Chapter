import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { userId: adminId } = await auth();

        if (adminId !== process.env.ADMIN_USER_ID) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const targetUserId = searchParams.get('userId');

        if (!targetUserId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            const clerk = await clerkClient();
            const user = await clerk.users.getUser(targetUserId);

            const ordersQuery = `
                SELECT 
                    o.id AS order_id,
                    o.created_at,
                    o.delivered_date,
                    o.estimated_delivery_date,
                    o.payment_status,
                    o.delivery_status,
                    o.tracking_number,
                    o.shipping_address,
                    COALESCE(SUM(oi.price_at_time * oi.quantity), 0) AS total_spent,
                    json_agg(
                        jsonb_build_object(
                        'book_id', b.id,
                        'title', b.title,
                        'author', b.authors,
                        'quantity', oi.quantity,
                        'price_at_time', oi.price_at_time,
                        'subtotal', oi.price_at_time * oi.quantity
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL) AS items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN books b ON oi.book_id = b.id
                WHERE o.user_id = $1 AND payment_status != 'pending'
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `;

            const ordersResult = await client.query(ordersQuery, [targetUserId]);

            // Calculate total spent
            const totalSpent = ordersResult.rows.reduce((sum, order) => sum + Number(order.total_spent || 0), 0);

            const userData = {
                userInfo: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    emailAddresses: user.emailAddresses.map(e => ({
                        id: e.id,
                        emailAddress: e.emailAddress,
                        verification: e.verification,
                    })),
                    primaryEmailAddressId: user.primaryEmailAddressId,
                    imageUrl: user.imageUrl,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    lastSignInAt: user.lastSignInAt,
                    publicMetadata: user.publicMetadata || {},
                    privateMetadata: user.privateMetadata || {},
                },
                orders: ordersResult.rows.map(order => ({
                    ...order,
                    items: order.items || [],
                })),
                totalSpent: totalSpent.toString(),
            };

            return NextResponse.json(userData);
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
} 