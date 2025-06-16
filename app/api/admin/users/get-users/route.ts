import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clerkClient();
        const users = await client.users.getUserList({
            limit: 100,
        });

        const transformedUsers = users.data.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0]?.emailAddress || '',
            username: user.username,
            imageUrl: user.imageUrl,
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
            role: user.publicMetadata?.role || 'user',
            status: user.privateMetadata?.blocked ? 'blocked' : 'active'
        }));

        return NextResponse.json({ users: transformedUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}