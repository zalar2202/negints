import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import stripe from "@/lib/stripe";

export async function POST(request) {
    try {
        await dbConnect();

        if (!stripe) {
            return NextResponse.json({ error: "Stripe is not configured on the server" }, { status: 500 });
        }

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { invoiceId } = await request.json();

        if (!invoiceId) {
            return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
        }

        // Fetch invoice and populate client
        const invoice = await Invoice.findById(invoiceId).populate("client");
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Ensure user owns the invoice (unless admin/manager)
        const isAdmin = ["admin", "manager"].includes(user.role);
        if (!isAdmin && invoice.user?.toString() !== user._id.toString() && invoice.client?.linkedUser?.toString() !== user._id.toString()) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (invoice.status === "paid") {
            return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
        }

        // Determine amount to pay (either down payment or total)
        let amountToPay = invoice.total;
        let description = `Payment for Invoice ${invoice.invoiceNumber}`;

        if (invoice.paymentPlan?.isInstallment && invoice.status === "sent") {
            amountToPay = invoice.paymentPlan.downPayment || invoice.total;
            description = `Down Payment for Invoice ${invoice.invoiceNumber}`;
        } else if (invoice.status === "partial") {
            amountToPay = invoice.total - (invoice.paymentPlan?.downPayment || 0);
            description = `Remaining Balance for Invoice ${invoice.invoiceNumber}`;
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: invoice.currency?.toLowerCase() || "usd",
                        product_data: {
                            name: description,
                            description: `NeginTS - Invoice #${invoice.invoiceNumber}`,
                        },
                        unit_amount: Math.round(amountToPay * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/invoices?id=${invoiceId}&status=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/invoices?id=${invoiceId}&status=cancel`,
            metadata: {
                invoiceId: invoice._id.toString(),
                userId: user._id.toString(),
                type: invoice.status === "partial" ? "balance" : "initial",
            },
            customer_email: invoice.client?.email,
        });

        return NextResponse.json({ success: true, url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
    }
}
