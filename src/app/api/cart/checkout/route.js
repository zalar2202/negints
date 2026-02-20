import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import Package from "@/models/Package";
import ProductCategory from "@/models/ProductCategory";
import { convertToBaseCurrency, convertFromBaseCurrency } from "@/lib/currency";

// Helper to generate Invoice Number (copied from invoices API for consistency)
function generateInvoiceNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${date}-${random}`;
}

export async function POST(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.json().catch(() => ({}));
        const { userId, clientId: bodyClientId } = body;
        const isAdmin = ["admin", "manager"].includes(user.role);
        
        // If admin provides a userId, they are checking out THEIR CURRENT CART for THAT user.
        // Otherwise, it's a normal user checking out THEIR OWN CART.
        // Actually, let's make it explicit:
        // cartSourceId: whose cart are we reading from?
        // targetUserId: who is the invoice for?
        const cartSourceId = user._id; 
        let targetUserId = (isAdmin && userId) ? userId : user._id;
        let targetClientId = (isAdmin && bodyClientId) ? bodyClientId : null;

        const cart = await Cart.findOne({ user: cartSourceId })
            .populate({
                path: "items.package",
                populate: { path: "categoryId", strictPopulate: false },
                strictPopulate: false
            })
            .populate("appliedPromotion");

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 1. Find or Create Client record
        let client;
        if (targetClientId) {
            client = await Client.findById(targetClientId);
            if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
            targetUserId = client.linkedUser || targetUserId;
        } else {
            client = await Client.findOne({ linkedUser: targetUserId });
        }

        if (!client) {
            // Fetch the user details for the client record
            let targetUser = user;
            if (targetUserId.toString() !== user._id.toString()) {
                const User = (await import("@/models/User")).default;
                targetUser = await User.findById(targetUserId);
            }

            if (!targetUser) return NextResponse.json({ error: "User/Client mapping failed. Please create client first." }, { status: 404 });

            client = await Client.create({
                name: targetUser.name,
                email: targetUser.email,
                linkedUser: targetUserId,
                company: targetUser.company || '',
                website: targetUser.website || '',
                taxId: targetUser.taxId || '',
                whatsapp: targetUser.whatsapp || '',
                preferredCommunication: targetUser.preferredCommunication || 'email',
                address: {
                    street: targetUser.address?.street || '',
                    city: targetUser.address?.city || '',
                    state: targetUser.address?.state || '',
                    zip: targetUser.address?.zip || '',
                    country: targetUser.address?.country || '',
                },
                status: 'active'
            });
        }

        // 2. Prepare Invoice Data
        const currency = cart.currency || client.currency || 'IRT';
        
        // Convert Items to Selected Currency
        const items = await Promise.all(cart.items.map(async (cartItem) => {
            const usdPrice = cartItem.package.price;
            const { amount: unitPrice } = await convertFromBaseCurrency(usdPrice, currency);
            const quantity = cartItem.quantity;
            const amount = unitPrice * quantity;
            const description = cartItem.billingCycle && cartItem.billingCycle !== "one-time" 
                ? `${cartItem.package.name} (${cartItem.billingCycle})`
                : cartItem.package.name;
                
            return {
                description: description,
                quantity: quantity,
                unitPrice: unitPrice,
                package: cartItem.package._id,
                amount: amount
            };
        }));

        let subtotal = items.reduce((sum, item) => sum + item.amount, 0);

        // Calculate Promotion Discount in Selected Currency
        let promotionDiscount = 0;
        let appliedPromoCode = null;
        if (cart.appliedPromotion) {
            const promo = cart.appliedPromotion;
            
            // Check category applicability
            let applicableSubtotal = subtotal;
            // Note: Since items are strictly mapped from cart, we trust the categorization logic
            if (promo.applicableCategories && promo.applicableCategories.length > 0) {
                 const applicableItems = items.filter((item, idx) => {
                    const pkg = cart.items[idx].package;
                    const catName = pkg?.categoryId?.name || pkg?.displayCategory || pkg?.category;
                    const catSlug = pkg?.categoryId?.slug;
                    return promo.applicableCategories.includes(catName) || promo.applicableCategories.includes(catSlug);
                 });
                 applicableSubtotal = applicableItems.reduce((acc, item) => acc + item.amount, 0);
            }

            const now = new Date();
            // TODO: Ideally re-verify minPurchase against converted subtotal or convert minPurchase
            // keeping simple for now assuming promo logic holds
            const isValid = promo.isActive && 
                             (!promo.startDate || promo.startDate <= now) && 
                             (!promo.endDate || promo.endDate >= now) &&
                             (promo.usageLimit === null || promo.usedCount < promo.usageLimit);

            if (isValid) {
                if (promo.discountType === 'percentage') {
                    promotionDiscount = (applicableSubtotal * promo.discountValue) / 100;
                } else {
                    // Fixed discount is usually in base currency (USD), convert it
                    const { amount: convertedDiscount } = await convertFromBaseCurrency(promo.discountValue, currency);
                    promotionDiscount = convertedDiscount;
                }
                promotionDiscount = Math.min(promotionDiscount, applicableSubtotal);
                appliedPromoCode = promo.discountCode;

                // Increment usage
                const Promotion = (await import("@/models/Promotion")).default;
                await Promotion.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
            }
        }

        const total = Math.max(0, subtotal - promotionDiscount);
        
        // Calculate Base Currency for Accounting (Reverse conversion to be safe/consistent)
        const { amount: totalInBase, rate: exchangeRate } = await convertToBaseCurrency(total, currency);

        const invoiceData = {
            invoiceNumber: generateInvoiceNumber(),
            client: client._id,
            user: targetUserId,
            package: cart.items[0]?.package?._id, 
            status: 'sent', 
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            items: items,
            subtotal: Number(subtotal.toFixed(2)),
            promotion: {
                code: appliedPromoCode,
                discountAmount: Number(promotionDiscount.toFixed(2)),
                discountType: cart.appliedPromotion?.discountType || 'fixed',
                discountValue: cart.appliedPromotion?.discountValue || 0
            },
            total: Number(total.toFixed(2)),
            currency: currency,
            exchangeRate: exchangeRate,
            totalInBaseCurrency: totalInBase,
            createdBy: user._id
        };

        const invoice = await Invoice.create(invoiceData);

        // 3. Clear Cart
        cart.items = [];
        cart.appliedPromotion = null;
        await cart.save();

        return NextResponse.json({ 
            success: true, 
            message: "Invoice issued successfully", 
            invoiceId: invoice._id 
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
