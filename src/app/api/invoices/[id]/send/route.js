import { NextResponse } from 'next/server';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get Invoice with Client
        const invoice = await Invoice.findById(id).populate('client');
        
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (!invoice.client?.email) {
            return NextResponse.json({ error: 'Client has no email address' }, { status: 400 });
        }

        // Format items for email
        const itemsHtml = invoice.items.map(item => 
            `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.amount.toFixed(2)}</td>
            </tr>`
        ).join('');

        // Build Email
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @media screen and (max-width: 600px) {
                        .content { padding: 15px !important; }
                        .item-table th, .item-table td { font-size: 13px !important; padding: 8px 4px !important; }
                        .header { padding: 20px !important; }
                        .header h1 { font-size: 20px !important; }
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f7ff;">
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333;">
                    <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">Invoice ${invoice.invoiceNumber}</h1>
                    </div>
                    
                    <div class="content" style="padding: 30px; background: #f9fafb;">
                        <p style="font-size: 16px;">Dear <strong>${invoice.client.name}</strong>,</p>
                        <p style="color: #666;">Please find your invoice details below:</p>
                        
                        <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; overflow-x: auto;">
                            <table class="item-table" style="width: 100%; border-collapse: collapse; min-width: 450px;">
                                <thead>
                                    <tr style="background: #f3f4f6;">
                                        <th style="padding: 12px 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Description</th>
                                        <th style="padding: 12px 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
                                        <th style="padding: 12px 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Price</th>
                                        <th style="padding: 12px 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" style="padding: 15px 10px 5px; text-align: right; color: #6b7280;">Subtotal:</td>
                                        <td style="padding: 15px 10px 5px; text-align: right; font-weight: bold;">$${invoice.subtotal.toFixed(2)}</td>
                                    </tr>
                                    ${invoice.taxRate > 0 ? `
                                    <tr>
                                        <td colspan="3" style="padding: 5px 10px; text-align: right; color: #6b7280;">Tax (${invoice.taxRate}%):</td>
                                        <td style="padding: 5px 10px; text-align: right; font-weight: bold;">$${invoice.taxAmount.toFixed(2)}</td>
                                    </tr>
                                    ` : ''}
                                    <tr style="font-size: 18px; font-weight: bold;">
                                        <td colspan="3" style="padding: 15px 10px; text-align: right; color: #667eea;">Total Due:</td>
                                        <td style="padding: 15px 10px; text-align: right; color: #667eea;">$${invoice.total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        ${invoice.paymentPlan?.isInstallment ? `
                        <div style="background: #eef2ff; border: 1px solid #c3dafe; border-radius: 12px; padding: 20px; margin: 20px 0;">
                            <h4 style="margin: 0 0 15px 0; color: #4338ca; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; border-bottom: 1px solid #c3dafe; padding-bottom: 10px;">Payment Breakdown</h4>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">Total Package Value:</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111827;">$${invoice.total.toFixed(2)}</td>
                                </tr>
                                
                                <!-- Down Payment Row -->
                                <tr style="background-color: ${['partial', 'paid'].includes(invoice.status) ? '#ecfdf5' : '#fffbeb'};">
                                    <td style="padding: 10px; color: ${['partial', 'paid'].includes(invoice.status) ? '#065f46' : '#92400e'}; border-radius: 6px 0 0 6px;">
                                        ${['partial', 'paid'].includes(invoice.status) ? 'Down Payment (Paid)' : 'Down Payment (Due Now)'}:
                                    </td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold; color: ${['partial', 'paid'].includes(invoice.status) ? '#059669' : '#d97706'}; border-radius: 0 6px 6px 0;">
                                        $${invoice.paymentPlan.downPayment.toFixed(2)}
                                    </td>
                                </tr>

                                <!-- Remaining Balance Row -->
                                <tr style="background-color: ${invoice.status === 'partial' ? '#fffbeb' : invoice.status === 'paid' ? '#ecfdf5' : 'transparent'};">
                                    <td style="padding: 10px; color: ${invoice.status === 'partial' ? '#92400e' : invoice.status === 'paid' ? '#065f46' : '#6b7280'}; border-radius: 6px 0 0 6px;">
                                        ${invoice.status === 'partial' ? 'Remaining Balance (Due Now)' : invoice.status === 'paid' ? 'Remaining Balance (Paid)' : 'Remaining Balance (Deferred)'}:
                                    </td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold; color: ${invoice.status === 'partial' ? '#d97706' : invoice.status === 'paid' ? '#059669' : '#6b7280'}; border-radius: 0 6px 6px 0;">
                                        $${(invoice.total - invoice.paymentPlan.downPayment).toFixed(2)}
                                    </td>
                                </tr>

                                ${invoice.paymentPlan.installmentAmount > 0 ? `
                                <tr>
                                    <td colspan="2" style="padding-top: 15px;"></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Installments:</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1e1b4b;">${invoice.paymentPlan.installmentsCount} x $${invoice.paymentPlan.installmentAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Frequency:</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1e1b4b; text-transform: capitalize;">${invoice.paymentPlan.period}</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>
                        ` : ''}
                        
                        <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;"><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/panel/invoices?id=${id}" style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Pay Invoice</a>
                        </div>
                        
                        ${invoice.notes ? `
                        <div style="background: #fffbef; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-size: 14px; color: #92400e; white-space: pre-wrap;">
                            <strong>Note:</strong> ${invoice.notes}
                        </div>
                        ` : ''}
                        
                        <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; pt-20">
                            <p style="margin-bottom: 5px;">Thank you for your business!</p>
                            <p style="font-weight: bold; color: #4b5563;">NeginTS</p>
                        </div>
                        <div style="display:none; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">Ref: ${new Date().getTime()}-${Math.random().toString(36).substring(7)}</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send Email
        await sendEmail({
            to: invoice.client.email,
            subject: `Invoice ${invoice.invoiceNumber} from NeginTS`,
            html: emailHtml
        });

        // Update Invoice Status to Sent
        await Invoice.findByIdAndUpdate(id, { status: 'sent' });

        return NextResponse.json({ 
            success: true, 
            message: `Invoice sent to ${invoice.client.email}` 
        });

    } catch (error) {
        console.error('Send invoice error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send invoice' }, { status: 500 });
    }
}
