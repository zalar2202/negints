import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Check Authentication Status
 * GET /api/auth/check
 *
 * Verifies JWT token and returns current user data
 */
export async function GET() {
    try {
        // Get token from httpOnly cookie
        const token = await getAuthToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: true,
                    authenticated: false,
                    message: "Guest session",
                },
                { status: 200 }
            );
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return NextResponse.json(
                {
                    success: true,
                    authenticated: false,
                    message: error.message || "Invalid or expired token",
                },
                { status: 200 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: true,
                    authenticated: false,
                    message: "User not found",
                },
                { status: 200 }
            );
        }

        // Check if user is still active
        if (user.status !== "active") {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    message: "Account is not active",
                },
                { status: 403 }
            );
        }

        // Return user data
        return NextResponse.json(
            {
                success: true,
                authenticated: true,
                message: "User is authenticated",
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    phone: user.phone,
                    avatar: user.avatar,
                    bio: user.bio,
                    company: user.company,
                    website: user.website,
                    taxId: user.taxId,
                    whatsapp: user.whatsapp,
                    preferredCommunication: user.preferredCommunication,
                    address: user.address,
                    preferences: user.preferences,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    lastPasswordChange: user.lastPasswordChange,
                    technicalDetails: user.technicalDetails,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Auth check error:", error);
        console.error("DB URI Present:", !!process.env.MONGO_URI);
        console.error("JWT Secret Present:", !!process.env.JWT_SECRET);

        return NextResponse.json(
            {
                success: false,
                authenticated: false,
                message: "Authentication check failed",
                error: error.message,
                stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
