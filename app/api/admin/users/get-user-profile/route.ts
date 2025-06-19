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

            const query = `
            SELECT 
            COALESCE(SUM(oi.price_at_time * oi.quantity), 0) as total_spent,
            COUNT(DISTINCT o.id) as total_orders,
            json_agg(
            DISTINCT jsonb_build_object(
                'order_id', o.id,
                'created_at', o.created_at,
                'delivery_status', o.delivery_status,
              'total', COALESCE(SUM(oi.price_at_time * oi.quantity), 0)
            )
            ) as orders
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.user_id
`;

            const result = await client.query(query, [targetUserId]);

            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0]?.emailAddress,
                username: user.username,
                imageUrl: user.imageUrl,
                createdAt: user.createdAt,
                lastSignInAt: user.lastSignInAt,
                status: user.publicMetadata.status ? 'blocked' : 'active',
                role: user.publicMetadata.role || 'user',
                ...result.rows[0],
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