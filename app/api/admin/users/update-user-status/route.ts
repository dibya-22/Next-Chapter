import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const { userId, isDisabled } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const { userId: adminId } = await auth();
        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (adminId !== process.env.ADMIN_USER_ID) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get current status
        const currentStatusResult = await pool.query(
            "SELECT is_disabled FROM users WHERE id = $1",
            [userId]
        );

        if (currentStatusResult.rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isCurrentlyDisabled = currentStatusResult.rows[0].is_disabled;

        // Update user status
        const result = await pool.query(
            "UPDATE users SET is_disabled = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [isDisabled, userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
        }

        return NextResponse.json({
            message: `User ${isCurrentlyDisabled ? 'enabled' : 'disabled'} successfully`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
