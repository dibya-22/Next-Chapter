import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import pool, { checkDatabaseConnection } from "@/lib/db";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ 
            error: "Unauthorized",
            details: "User not authenticated"
        }, { status: 401 });
    }

    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
        return NextResponse.json({ 
            error: "Database connection error",
            details: "Unable to connect to the database"
        }, { status: 500 });
    }

    const client = await pool.connect();
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
        
        // Add debug logging
        console.log('Payment verification request:', {
            userId,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature ? 'present' : 'missing'
        });

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('Missing required fields:', { 
                orderId: !!razorpay_order_id,
                paymentId: !!razorpay_payment_id,
                signature: !!razorpay_signature
            });
            return NextResponse.json({ 
                error: "Missing required fields",
                details: "All payment verification fields are required"
            }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error('Missing RAZORPAY_KEY_SECRET environment variable');
            return NextResponse.json({ 
                error: "Server configuration error",
                details: "Payment gateway configuration is missing"
            }, { status: 500 });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        console.log('Signature verification:', {
            body,
            expectedSignature,
            receivedSignature: razorpay_signature,
            matches: expectedSignature === razorpay_signature
        });

        if (expectedSignature !== razorpay_signature) {
            console.error('Invalid signature');
            return NextResponse.json({ 
                error: "Invalid signature",
                details: "Payment verification failed due to invalid signature"
            }, { status: 400 });
        }

        await client.query("BEGIN");

        // First check if payment already exists and is completed
        const checkPaymentQuery = `
            SELECT id, status 
            FROM payments 
            WHERE razorpay_order_id = $1 AND user_id = $2
        `;
        const existingPayment = await client.query(checkPaymentQuery, [razorpay_order_id, userId]);

        if (existingPayment.rows.length > 0) {
            if (existingPayment.rows[0].status === 'completed') {
                await client.query("ROLLBACK");
                return NextResponse.json({ 
                    error: "Payment already processed",
                    details: "This payment has already been verified and processed"
                }, { status: 400 });
            }
        }

        // Update payment status
        const updatePaymentQuery = `
            UPDATE payments
            SET status = 'completed', razorpay_payment_id = $1
            WHERE razorpay_order_id = $2 AND user_id = $3
            RETURNING id
        `;

        const paymentResult = await client.query(updatePaymentQuery, [
            razorpay_payment_id,
            razorpay_order_id,
            userId
        ]);

        if (paymentResult.rows.length === 0) {
            console.error('Payment not found:', {
                orderId: razorpay_order_id,
                userId
            });
            await client.query("ROLLBACK");
            return NextResponse.json({ 
                error: "Payment not found",
                details: "No payment record found for the given order ID"
            }, { status: 404 });
        }

        // Update order status and add order items
        const orderItemsQuery = `
            WITH updated_order AS (
                UPDATE orders 
                SET payment_status = 'completed', delivery_status = 'processing'
                WHERE payment_id = $1 AND user_id = $2
                RETURNING id
            )
            INSERT INTO order_items (order_id, book_id, quantity, price_at_time)
            SELECT 
                o.id, 
                c.book_id, 
                c.quantity, 
                ROUND(c.original_price * (1 - (c.discount::numeric / 100)), 2) as price_at_time
            FROM updated_order o
            JOIN cart c ON c.user_id = $2
            RETURNING order_id, book_id, quantity, price_at_time
        `;

        console.log('Executing order items query with:', {
            paymentId: paymentResult.rows[0].id,
            userId
        });

        const orderResult = await client.query(orderItemsQuery, [paymentResult.rows[0].id, userId]);

        console.log('Order items created:', orderResult.rows);

        if (orderResult.rows.length === 0) {
            console.error('No items found in cart for order:', {
                paymentId: paymentResult.rows[0].id,
                userId
            });
            await client.query("ROLLBACK");
            return NextResponse.json({ 
                error: "No items found",
                details: "No items found in cart for this order"
            }, { status: 400 });
        }

        // Clear cart
        await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);

        await client.query("COMMIT");
        return NextResponse.json({ 
            success: true,
            orderId: orderResult.rows[0].order_id
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error verifying payment:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId
        });
        return NextResponse.json({ 
            error: "Payment verification failed",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        client.release();
    }
}