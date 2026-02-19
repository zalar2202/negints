import { NextResponse } from 'next/server';
import Ticket from '@/models/Ticket';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

// Add a reply/message to a ticket
export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.message || body.message.trim() === '') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Check access
        const isStaff = ['admin', 'manager'].includes(user.role);
        const isOwner = ticket.createdBy.toString() === user._id.toString();
        
        if (!isStaff && !isOwner) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Only staff can add internal notes
        if (body.isInternal && !isStaff) {
            return NextResponse.json({ error: 'Cannot add internal notes' }, { status: 403 });
        }

        // Create message
        const newMessage = {
            sender: user._id,
            message: body.message,
            isInternal: body.isInternal || false,
            attachments: body.attachments || []
        };

        // Update ticket
        const updateData = {
            $push: { messages: newMessage },
            lastResponseAt: new Date()
        };

        // Update status based on who replied
        if (isStaff && !body.isInternal) {
            updateData.status = 'waiting_customer';
        } else if (isOwner) {
            updateData.status = 'waiting_staff';
        }

        // Reopen if was closed/resolved
        if (['closed', 'resolved'].includes(ticket.status) && !body.isInternal) {
            updateData.status = 'open';
            updateData.resolvedAt = null;
            updateData.closedAt = null;
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('messages.sender', 'name email avatar role');

        return NextResponse.json({ 
            success: true, 
            data: updatedTicket.messages[updatedTicket.messages.length - 1] 
        });

    } catch (error) {
        console.error('Reply error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
