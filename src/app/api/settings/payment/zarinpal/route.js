import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

import { COOKIE_NAMES } from "@/constants/config";

// Helper to check admin access
async function checkAdminAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.TOKEN);

    if (!token) throw new Error("Unauthorized");

    try {
        const decoded = verifyToken(token.value);
        if (decoded.role !== "admin" && decoded.role !== "manager") {
            throw new Error("Forbidden");
        }
        return decoded;
    } catch (e) {
        throw new Error("Unauthorized");
    }
}

export async function GET() {
    try {
        await checkAdminAuth();
        await dbConnect();

        const setting = await Setting.findOne({ key: "payment_zarinpal" });
        
        // Return default structure if not set yet
        const data = setting?.value || {
            isEnabled: false,
            isSandbox: true,
            merchantId: "",
            description: "Online Payment via Zarinpal"
        };

        // Mask Merchant ID for security if it exists and has length
        if (data.merchantId && data.merchantId.length > 10) {
            data.merchantId = data.merchantId.substring(0, 4) + "****" + data.merchantId.substring(data.merchantId.length - 4);
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Fetch Payment Settings Error:", error);
        if (error.message === "Unauthorized" || error.message === "Forbidden") {
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        }
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const user = await checkAdminAuth();
        const body = await req.json();
        
        // Basic validation
        const { isEnabled, isSandbox, merchantId, description } = body;

        await dbConnect();

        // Find existing to check if we need to update MerchantID (handle masking)
        const existing = await Setting.findOne({ key: "payment_zarinpal" });
        let finalMerchantId = merchantId;

        // If incoming merchantId is masked (contains ****) and we have an existing one, keep the old one
        // This is a simple check. A better way is to only update if it changed and isn't masked.
        if (merchantId && merchantId.includes("****") && existing?.value?.merchantId) {
             finalMerchantId = existing.value.merchantId;
        }

        const newValue = {
            isEnabled: Boolean(isEnabled),
            isSandbox: Boolean(isSandbox),
            merchantId: finalMerchantId || "",
            description: description || "Online Payment"
        };

        const updated = await Setting.findOneAndUpdate(
            { key: "payment_zarinpal" },
            { 
                key: "payment_zarinpal",
                value: newValue,
                description: "Zarinpal Payment Gateway Configuration",
                lastUpdatedBy: user.userId 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, data: updated.value });
    } catch (error) {
         console.error("Update Payment Settings Error:", error);
        if (error.message === "Unauthorized" || error.message === "Forbidden") {
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        }
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
