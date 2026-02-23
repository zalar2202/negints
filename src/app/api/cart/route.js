import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Package from "@/models/Package";
import ProductCategory from "@/models/ProductCategory";

export async function GET(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get("userId");
        const isAdmin = ["admin", "manager"].includes(user.role);

        const cartUserId = (isAdmin && targetUserId) ? targetUserId : user._id;

        let cart = await Cart.findOne({ user: cartUserId })
            .populate({
                path: "items.package",
                populate: { path: "categoryId", strictPopulate: false },
                strictPopulate: false
            })
            .populate("appliedPromotion");
            
        if (!cart) {
            cart = await Cart.create({ user: cartUserId, items: [] });
        }

        return NextResponse.json({ success: true, data: cart });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { promotionId, currency, userId } = await request.json();
        const isAdmin = ["admin", "manager"].includes(user.role);
        const cartUserId = (isAdmin && userId) ? userId : user._id;

        const cart = await Cart.findOne({ user: cartUserId });
        if (!cart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

        if (promotionId !== undefined) cart.appliedPromotion = promotionId || null;
        if (currency !== undefined) cart.currency = currency;
        
        await cart.save();

        const populatedCart = await cart.populate([
            { 
                path: "items.package",
                populate: { path: "categoryId", strictPopulate: false },
                strictPopulate: false
            },
            { path: "appliedPromotion" }
        ]);

        return NextResponse.json({ success: true, data: populatedCart });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { packageId, quantity = 1, billingCycle = "one-time", userId, size } = await request.json();
        const isAdmin = ["admin", "manager"].includes(user.role);
        const cartUserId = (isAdmin && userId) ? userId : user._id;

        let cart = await Cart.findOne({ user: cartUserId });
        if (!cart) {
            cart = new Cart({ user: cartUserId, items: [] });
        }

        // Check if item exists with same package and size
        const existingItemIndex = cart.items.findIndex(
            (item) => item.package.toString() === packageId && item.size === size
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ package: packageId, quantity, billingCycle, size });
        }

        await cart.save();
        const populatedCart = await cart.populate({
            path: "items.package",
            populate: { path: "categoryId", strictPopulate: false },
            strictPopulate: false
        });

        return NextResponse.json({ success: true, data: populatedCart });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { itemId, userId } = await request.json();
        const isAdmin = ["admin", "manager"].includes(user.role);
        const cartUserId = (isAdmin && userId) ? userId : user._id;

        const cart = await Cart.findOne({ user: cartUserId });
        if (cart) {
            cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
            await cart.save();
        }

        const populatedCart = await (cart ? cart.populate({
            path: "items.package",
            populate: { path: "categoryId", strictPopulate: false },
            strictPopulate: false
        }) : { items: [] });
        return NextResponse.json({ success: true, data: populatedCart });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
