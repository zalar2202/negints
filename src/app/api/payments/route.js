import { NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { convertToBaseCurrency } from '@/lib/currency';

export async function GET(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        const query = {};
        if (clientId) query.client = clientId;

        const payments = await Payment.find(query)
            .populate('client', 'name email')
            .populate('invoice', 'invoiceNumber total')
            .populate('recordedBy', 'name')
            .sort({ paymentDate: -1 });

        return NextResponse.json({ success: true, data: payments });
    } catch (error) {
        console.error('Payment fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.client || !body.amount) {
            return NextResponse.json({ error: 'Client and amount are required' }, { status: 400 });
        }

        // Calculate Base Currency values
        const { amount: amountInBase, rate } = await convertToBaseCurrency(body.amount, body.currency || 'USD');

        // Create Payment
        const payment = await Payment.create({
            ...body,
            amountInBaseCurrency: amountInBase,
            exchangeRate: rate,
            recordedBy: user._id
        });

        // If linked to an invoice and payment is completed, optionally mark invoice as paid
        if (body.invoice && body.status === 'completed') {
            await Invoice.findByIdAndUpdate(body.invoice, { status: 'paid' });
        }

        return NextResponse.json({ success: true, data: payment }, { status: 201 });

    } catch (error) {
        console.error('Payment creation error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
