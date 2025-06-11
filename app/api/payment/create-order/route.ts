import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import pool from "@/lib/db";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const client = await pool.connect();
    try {
        const { amount, shippingAddress } = await request.json();
        
        console.log('Creating order with:', { amount, shippingAddress, userId });

        if (!amount || !shippingAddress) {
            console.error('Missing required fields:', { amount, shippingAddress });
            return NextResponse.json({ error: "Amount and shipping address are required" }, { status: 400 });
        }

        // Check if tables exist
        const checkTablesQuery = `
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'payments'
        ) as payments_exists,
        EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'orders'
        ) as orders_exists,
        EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'order_items'
        ) as order_items_exists;
        `;

        const tablesCheck = await client.query(checkTablesQuery);
        const { payments_exists, orders_exists, order_items_exists } = tablesCheck.rows[0];

        if (!payments_exists || !orders_exists || !order_items_exists) {
            console.error('Required tables do not exist:', { payments_exists, orders_exists, order_items_exists });
            return NextResponse.json({ 
                error: "Database tables not set up correctly",
                details: "Required tables (payments, orders, order_items) do not exist"
            }, { status: 500 });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_${Date.now()}`,
        };

        console.log('Creating Razorpay order with options:', options);

        const order = await razorpay.orders.create(options);
        console.log('Razorpay order created:', order);

        await client.query("BEGIN");

        const paymentQuery = `
        INSERT INTO payments (user_id, razorpay_order_id, amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id`;

        console.log('Creating payment record with:', { userId, orderId: order.id, amount });
        const paymentResult = await client.query(paymentQuery, [userId, order.id, amount]);
        console.log('Payment record created:', paymentResult.rows[0]);

        // Get the orders table structure
        const tableInfoQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'orders';
        `;
        const tableInfo = await client.query(tableInfoQuery);
        console.log('Orders table structure:', tableInfo.rows);

        const orderQuery = `
        INSERT INTO orders (
            user_id,
            payment_id,
            payment_status,
            shipping_address,
            delivery_status,
            estimated_delivery_date,
            created_at,
            updated_at
        ) VALUES ($1, $2, 'pending', $3, 'Order Placed', NOW() + INTERVAL '5 days', NOW(), NOW())
        RETURNING id
        `;

        console.log('Creating order record with:', {
            userId,
            paymentId: paymentResult.rows[0].id,
            shippingAddress
        });
        const orderResult = await client.query(orderQuery, [
            userId,
            paymentResult.rows[0].id,
            shippingAddress
        ]);
        console.log('Order record created:', orderResult.rows[0]);

        await client.query("COMMIT");

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating order: ", error);
        return NextResponse.json({ 
            error: "Error creating payment order",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        client.release();
    }
}