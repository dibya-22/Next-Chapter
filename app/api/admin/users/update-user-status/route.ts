import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const { userId, isDisabled } = await request.json();
        if (!userId || typeof isDisabled !== 'boolean') {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        const { userId: adminId } = await auth();
        if (!adminId || adminId !== process.env.ADMIN_USER_ID) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
            privateMetadata: {
                disabled: isDisabled,
                blocked: isDisabled,
            },
        });

        return NextResponse.json({
            success: true,
            message: `User ${isDisabled ? "blocked" : "activated"} successfully`,
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
