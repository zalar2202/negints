import { NextResponse } from 'next/server';
import { requestPayment } from '@/lib/zarinpal';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function POST(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { invoiceId, description } = await request.json();

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        const invoice = await Invoice.findById(invoiceId).populate('client');
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Zarinpal expects Toman. Our system uses IRT (Toman) as base currency now.
        const amount = invoice.total;
        
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const callbackUrl = `${protocol}://${host}/api/payments/zarinpal/verify?invoiceId=${invoiceId}`;

        const result = await requestPayment({
            amount,
            description: description || `Payment for Invoice ${invoice.invoiceNumber}`,
            callbackUrl,
            metadata: {
                mobile: invoice.client?.phone || '',
                email: invoice.client?.email || ''
            }
        });

        if (result.success) {
            // Store authority in invoice or a separate payment attempt log if needed
            invoice.paymentNotes = `Zarinpal Authority: ${result.authority}`;
            await invoice.save();

            return NextResponse.json({ success: true, url: result.paymentUrl });
        }

        return NextResponse.json({ error: result.message }, { status: 400 });

    } catch (error) {
        console.error('Zarinpal Request Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
