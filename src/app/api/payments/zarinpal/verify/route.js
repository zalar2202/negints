import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/zarinpal';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Package from '@/models/Package';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');
        const authority = searchParams.get('Authority');
        const status = searchParams.get('Status');

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://negints.com';
        
        if (!invoiceId || !authority) {
            return NextResponse.redirect(new URL('/panel/accounting?status=error&message=invalid_params', appUrl));
        }

        if (status !== 'OK') {
            return NextResponse.redirect(new URL(`/panel/accounting?status=cancelled&invoiceId=${invoiceId}`, appUrl));
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return NextResponse.redirect(new URL('/panel/accounting?status=error&message=invoice_not_found', appUrl));
        }

        const result = await verifyPayment(invoice.total * 10, authority);

        if (result.success) {
            // Update Invoice
            invoice.status = 'paid';
            invoice.paymentMethod = 'zarinpal';
            invoice.paymentNotes = `RefID: ${result.refId}`;
            await invoice.save();

            // Decrement Inventory Stock
            try {
                for (const item of invoice.items) {
                    if (item.package) {
                        const pkg = await Package.findById(item.package);
                        if (pkg) {
                            pkg.stock = Math.max(0, pkg.stock - Math.abs(item.quantity || 1));
                            
                            // Decrement size specific stock if present
                            if (item.size && pkg.sizes?.length > 0) {
                                const sizeIndex = pkg.sizes.findIndex(s => s.size === item.size);
                                if (sizeIndex !== -1) {
                                    pkg.sizes[sizeIndex].stock = Math.max(0, pkg.sizes[sizeIndex].stock - Math.abs(item.quantity || 1));
                                }
                            }
                            await pkg.save();
                        }
                    }
                }
            } catch (inventoryError) {
                console.error('Inventory Update Error:', inventoryError);
                // We don't block the response since payment was successful
            }

            // Create Payment Record
            await Payment.create({
                client: invoice.client,
                invoice: invoice._id,
                amount: invoice.total,
                currency: invoice.currency,
                method: 'zarinpal',
                status: 'completed',
                reference: result.refId.toString(),
                notes: `Zarinpal Payment verified. Authority: ${authority}`,
                paymentDate: new Date()
            });

            return NextResponse.redirect(new URL(`/panel/accounting?status=success&refId=${result.refId}`, appUrl));
        } else {
            return NextResponse.redirect(new URL(`/panel/accounting?status=failed&message=${result.message}`, appUrl));
        }

    } catch (error) {
        console.error('Zarinpal Verify Route Error:', error);
        return NextResponse.redirect(new URL('/panel/accounting?status=error', process.env.NEXT_PUBLIC_APP_URL || 'https://negints.com'));
    }
}
