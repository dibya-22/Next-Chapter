import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// GET user info by Clerk ID
export async function GET(
    request: NextRequest,
    context: { params: { userId: string } }
) {
    const userId = context.params.userId;

    try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        return NextResponse.json({ user });
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
}