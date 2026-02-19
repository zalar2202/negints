import { NextResponse } from 'next/server';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import Payment from '@/models/Payment';
import Package from '@/models/Package';
import Promotion from '@/models/Promotion';
import Ticket from '@/models/Ticket';
import Service from '@/models/Service';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = ['admin', 'manager'].includes(user.role);

        // Common stats for everyone
        const totalTickets = await Ticket.countDocuments(isAdmin ? { status: { $nin: ['resolved', 'closed'] } } : { user: user._id, status: { $nin: ['resolved', 'closed'] } });
        const activeServices = await Service.countDocuments(isAdmin ? { status: 'active' } : { user: user._id, status: 'active' });

        if (!isAdmin) {
            return NextResponse.json({
                success: true,
                data: {
                    tickets: totalTickets,
                    services: activeServices
                }
            });
        }

        // Admin only stats
        const [
            packages,
            promotions,
            clients,
            paymentsCount
        ] = await Promise.all([
            Package.countDocuments(),
            Promotion.countDocuments(),
            Client.countDocuments(),
            Payment.countDocuments()
        ]);

        // Calculate REAL REVENUE from Invoices (Accounting Source of Truth)
        // We sum 'totalInBaseCurrency' for all non-draft/non-cancelled invoices
        const revenueResult = await Invoice.aggregate([
            {
                $match: {
                    status: { $in: ['paid', 'partial', 'sent', 'overdue'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalInBaseCurrency' },
                    paidRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'paid'] },
                                '$totalInBaseCurrency',
                                0
                            ]
                        }
                    },
                    pendingRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['sent', 'overdue', 'partial']] },
                                '$totalInBaseCurrency',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const revenue = revenueResult[0] || { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0 };

        return NextResponse.json({
            success: true,
            data: {
                packages,
                promotions,
                clients,
                payments: paymentsCount,
                tickets: totalTickets,
                services: activeServices,
                revenue: {
                    total: revenue.totalRevenue,
                    paid: revenue.paidRevenue,
                    pending: revenue.pendingRevenue
                }
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
