import { NextResponse } from 'next/server';
import Invoice from '@/models/Invoice';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { paymentMethod } = body;

        if (!['bank_transfer', 'crypto', 'cash', 'other'].includes(paymentMethod)) {
            return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
        }

        const invoice = await Invoice.findById(id).populate('client');
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Check ownership: Either the invoice.user matches, OR the user is linked to the invoice.client
        const isDirectOwner = invoice.user?.toString() === user._id.toString();
        const isClientOwner = invoice.client?.linkedUser?.toString() === user._id.toString();
        const isAdmin = ['admin', 'manager'].includes(user.role);

        if (!isDirectOwner && !isClientOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        invoice.paymentMethod = paymentMethod;
        await invoice.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Payment method selected successfully',
            data: invoice
        });

    } catch (error) {
        console.error("Payment method update error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
