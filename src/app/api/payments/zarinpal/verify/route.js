import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/zarinpal';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');
        const authority = searchParams.get('Authority');
        const status = searchParams.get('Status');

        if (!invoiceId || !authority) {
            return NextResponse.redirect(new URL('/panel/accounting?status=error&message=invalid_params', request.url));
        }

        if (status !== 'OK') {
            return NextResponse.redirect(new URL(`/panel/accounting?status=cancelled&invoiceId=${invoiceId}`, request.url));
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return NextResponse.redirect(new URL('/panel/accounting?status=error&message=invoice_not_found', request.url));
        }

        const result = await verifyPayment(invoice.total, authority);

        if (result.success) {
            // Update Invoice
            invoice.status = 'paid';
            invoice.paymentMethod = 'zarinpal';
            invoice.paymentNotes = `RefID: ${result.refId}`;
            await invoice.save();

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

            return NextResponse.redirect(new URL(`/panel/accounting?status=success&refId=${result.refId}`, request.url));
        } else {
            return NextResponse.redirect(new URL(`/panel/accounting?status=failed&message=${result.message}`, request.url));
        }

    } catch (error) {
        console.error('Zarinpal Verify Route Error:', error);
        return NextResponse.redirect(new URL('/panel/accounting?status=error', request.url));
    }
}
