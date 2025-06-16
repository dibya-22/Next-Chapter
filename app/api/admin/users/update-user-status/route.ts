import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    const { userId } = await auth();

    // Temporarily remove admin check for testing
    // if (!userId || userId !== process.env.ADMIN_USER_ID) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const { targetUserId, newStatus } = await request.json();

        if (!targetUserId || !newStatus) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!["active", "blocked"].includes(newStatus)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Get current user data
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(targetUserId);
        const isCurrentlyDisabled = user.privateMetadata?.disabled === true;

        // Update user's status in private metadata
        await clerk.users.updateUser(targetUserId, {
            privateMetadata: { 
                ...user.privateMetadata,
                disabled: newStatus === "blocked",
                blocked: newStatus === "blocked"
            }
        });

        return NextResponse.json({ 
            success: true,
            message: `User ${newStatus === "blocked" ? "blocked" : "activated"} successfully`
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
        );
    }
}
