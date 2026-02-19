import { NextResponse } from 'next/server';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Service from '@/models/Service';
import Client from '@/models/Client';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { convertToBaseCurrency } from '@/lib/currency';

// GET Single Invoice
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invoice = await Invoice.findById(id).populate({
            path: 'client',
            populate: { path: 'linkedUser' }
        });
        
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Permission check: Admin/Manager can see everything, others only their own
        if (!['admin', 'manager'].includes(user.role)) {
            // Check if the invoice belongs to this user
            // We need to check both invoice.user and potentially the user linked to the client
            const isOwner = invoice.user?.toString() === user._id.toString();
            
            if (!isOwner) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return NextResponse.json({ success: true, data: invoice });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE Invoice
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const oldInvoice = await Invoice.findById(id);
        if (!oldInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Sanitize ObjectIds to avoid Mongoose casting errors with empty strings
        if (body.package === "") body.package = null;
        if (body.client === "") body.client = null;
        if (body.user === "") body.user = null;

        // Recalculate totals if items, taxRate, or promotion are provided
        if (body.items || body.taxRate !== undefined || body.promotion) {
             const items = body.items || oldInvoice.items || [];
             let subtotal = 0;
             const processedItems = items.map(item => {
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.unitPrice) || 0;
                const amount = quantity * price;
                subtotal += amount;
                return {
                    description: item.description,
                    quantity,
                    unitPrice: price,
                    amount
                };
            });
            body.items = processedItems;
            
            const taxRate = body.taxRate !== undefined ? Number(body.taxRate) : (oldInvoice.taxRate || 0);
            const taxAmount = subtotal * (taxRate / 100);
            
            body.subtotal = subtotal;
            body.taxAmount = taxAmount;
            
            // Handle promotion in total calculation
            const promo = body.promotion || oldInvoice.promotion || {};
            const promoAmount = (promo.discountType === 'percentage' && promo.discountValue)
                ? (subtotal * promo.discountValue) / 100
                : (promo.discountAmount || 0);
                
            body.total = Math.max(0, subtotal + taxAmount - promoAmount);

            // Recalculate Base Currency for Accounting
            const { amount: totalInBase, rate } = await convertToBaseCurrency(body.total, body.currency || oldInvoice.currency || 'USD');
            body.exchangeRate = rate;
            body.totalInBaseCurrency = totalInBase;
        }

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate('client');

        // Logic: If status changed to 'paid' and there's a package linked, activate/upsert service
        if (body.status === 'paid' && oldInvoice.status !== 'paid') {
            const invoiceForProcessing = await Invoice.findById(id).populate('client');

            // 1. Create Payment Record if it doesn't exist
            const existingPayment = await Payment.findOne({ invoice: id });
            if (!existingPayment) {
                await Payment.create({
                    client: invoiceForProcessing.client?._id,
                    invoice: id,
                    amount: invoiceForProcessing.total,
                    currency: invoiceForProcessing.currency,
                    amountInBaseCurrency: invoiceForProcessing.totalInBaseCurrency,
                    exchangeRate: invoiceForProcessing.exchangeRate,
                    method: invoiceForProcessing.paymentMethod || 'bank_transfer',
                    status: 'completed',
                    paymentDate: new Date(),
                    recordedBy: user._id,
                    notes: `Automatically recorded from Invoice ${invoiceForProcessing.invoiceNumber}`
                });
                console.log(`Payment record created for invoice ${invoiceForProcessing.invoiceNumber}`);
            }
            
            if (invoiceForProcessing.package) {
                let targetUserId = invoiceForProcessing.user;
                
                // If no direct user link, try to find the user linked to the client
                if (!targetUserId && invoiceForProcessing.client) {
                    targetUserId = invoiceForProcessing.client.linkedUser;
                }

                if (targetUserId) {
                    console.log(`Activating service for user ${targetUserId} with package ${invoiceForProcessing.package}`);
                    await Service.findOneAndUpdate(
                        { user: targetUserId, package: invoiceForProcessing.package },
                        { 
                            status: 'active',
                            startDate: new Date(),
                            // Default to 1 month validity
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
                            price: invoiceForProcessing.total,
                            invoice: id
                        },
                        { upsert: true, new: true }
                    );

                    // Ensure user is added to Client list if not already there
                    const existingClient = await Client.findOne({ linkedUser: targetUserId });
                    if (!existingClient) {
                         const userDoc = await User.findById(targetUserId);
                         if (userDoc) {
                             await Client.create({
                                 name: userDoc.name,
                                 email: userDoc.email,
                                 phone: userDoc.phone,
                                 linkedUser: targetUserId,
                                 status: 'active'
                             });
                         }
                    }
                } else {
                    console.warn(`Cannot activate service for invoice ${id}: No target user found.`);
                }
            }
        }

        return NextResponse.json({ success: true, data: invoice });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ 
            error: error.name === 'ValidationError' 
                ? Object.values(error.errors).map(val => val.message).join(', ')
                : error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}

// DELETE Invoice
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const invoice = await Invoice.findByIdAndDelete(id);

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
