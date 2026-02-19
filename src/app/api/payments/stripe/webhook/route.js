import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import { headers } from "next/headers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
    console.log("⚓ [WEBHOOK START] Request received at /api/payments/stripe/webhook");

    const sig = (await headers()).get("stripe-signature");
    let rawBody;

    try {
        // Essential for Next.js 16 to get the EXACT raw body for Stripe signatures
        const buffer = await request.arrayBuffer();
        rawBody = Buffer.from(buffer);
        console.log(`📏 Raw body size: ${rawBody.length} bytes. Signature present: ${!!sig}`);
    } catch (err) {
        console.error("❌ Webhook Error: Failed to read request body", err);
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (!stripe) {
        console.error("❌ Webhook Error: Stripe client not initialized. Check STRIPE_SECRET_KEY.");
        return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    let event;

    try {
        if (!webhookSecret) {
            console.warn("⚠️ STRIPE_WEBHOOK_SECRET is missing. Verification will likely fail.");
        } else {
            console.log(`🔑 Using Secret starting with: ${webhookSecret.substring(0, 8)}...`);
        }
        
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
        console.log("💡 Fix: Go to your Coolify settings and ensure STRIPE_WEBHOOK_SECRET is exactly what Stripe shows for this endpoint.");
        return NextResponse.json({ error: `Signature Error: ${err.message}` }, { status: 400 });
    }

    console.log(`✅ Webhook Verified: ${event.type} [${event.id}]`);

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoiceId;

        console.log(`📦 Processing metadata for Invoice ID: ${invoiceId}`);

        if (!invoiceId) {
            console.error("❌ Webhook Error: invoiceId missing from Stripe metadata. Check checkout route.");
            return NextResponse.json({ received: true });
        }

        await dbConnect();

        try {
            const invoice = await Invoice.findById(invoiceId);
            if (!invoice) {
                console.error(`❌ Webhook Error: Invoice ${invoiceId} not found in MongoDB.`);
                return NextResponse.json({ received: true });
            }

            console.log(`🔍 Found Invoice: ${invoice.invoiceNumber}. Status: ${invoice.status}`);

            // Create payment record
            const paymentAmount = session.amount_total / 100;
            const newPayment = await Payment.create({
                client: invoice.client,
                invoice: invoice._id,
                amount: paymentAmount,
                currency: session.currency?.toUpperCase(),
                method: "credit_card",
                status: "completed",
                reference: session.payment_intent || session.id,
                notes: `Stripe Payment - Session: ${session.id}`,
            });

            console.log(`💰 Created Payment Record: ${newPayment._id}`);

            // Update Invoice
            invoice.paymentMethod = "stripe";
            if (invoice.paymentPlan?.isInstallment && invoice.status === "sent") {
                invoice.status = "partial";
            } else {
                invoice.status = "paid";
            }

            await invoice.save();
            console.log(`🏁 SUCCESS: Invoice ${invoice.invoiceNumber} is now ${invoice.status.toUpperCase()}`);

        } catch (error) {
            console.error("❌ Webhook DB Update Error:", error);
            return NextResponse.json({ error: "DB error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
