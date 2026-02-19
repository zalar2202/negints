import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

export async function POST(request) {
    try {
        await connectDB();
        const { code, subtotal, items = [] } = await request.json();

        if (!code) {
            return NextResponse.json({ success: false, message: 'Code is required' }, { status: 400 });
        }

        const promo = await Promotion.findOne({ 
            discountCode: code.toUpperCase(), 
            isActive: true 
        });

        if (!promo) {
            return NextResponse.json({ success: false, message: 'Invalid promotion code' }, { status: 404 });
        }

        // Check dates
        const now = new Date();
        if (promo.startDate && promo.startDate > now) {
            return NextResponse.json({ success: false, message: 'This promotion has not started yet' }, { status: 400 });
        }
        if (promo.endDate && promo.endDate < now) {
            return NextResponse.json({ success: false, message: 'This promotion has expired' }, { status: 400 });
        }

        // Check usage limit
        if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
            return NextResponse.json({ success: false, message: 'This promotion has reached its usage limit' }, { status: 400 });
        }

        // Check category applicability if items are provided
        let applicableSubtotal = subtotal;
        if (promo.applicableCategories && promo.applicableCategories.length > 0 && items.length > 0) {
            const applicableItems = items.filter(item => {
                const category = item.category || item.package?.category;
                return promo.applicableCategories.includes(category);
            });

            if (applicableItems.length === 0) {
                const categoriesStr = promo.applicableCategories.join(', ');
                return NextResponse.json({ 
                    success: false, 
                    message: `This promotion only applies to: ${categoriesStr}` 
                }, { status: 400 });
            }

            applicableSubtotal = applicableItems.reduce((acc, item) => {
                const price = Number(item.price || item.unitPrice || item.package?.price) || 0;
                const quantity = Number(item.quantity) || 1;
                return acc + (price * quantity);
            }, 0);
        } else if (promo.applicableCategories && promo.applicableCategories.length > 0 && items.length > 0) {
            // If items are provided but don't have categories, and promotion HAS categories,
            // we should probably warn or assume they don't apply.
            // But for manual items, let's assume they don't apply if they don't have a category field.
            applicableSubtotal = 0; 
        }

        // Check minimum purchase (against total subtotal)
        if (subtotal < promo.minPurchase) {
            return NextResponse.json({ 
                success: false, 
                message: `Minimum purchase of $${promo.minPurchase} is required for this promotion` 
            }, { status: 400 });
        }

        // Calculate discount (on applicable subtotal)
        let discountAmount = 0;
        if (promo.discountType === 'percentage') {
            discountAmount = (applicableSubtotal * promo.discountValue) / 100;
        } else {
            discountAmount = promo.discountValue;
        }

        // Ensure discount doesn't exceed applicable subtotal
        discountAmount = Math.min(discountAmount, applicableSubtotal);

        return NextResponse.json({ 
            success: true, 
            data: {
                id: promo._id,
                code: promo.discountCode,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                discountAmount: Number(discountAmount.toFixed(2)),
                applicableCategories: promo.applicableCategories
            } 
        });

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({ success: false, message: 'Failed to validate promotion' }, { status: 500 });
    }
}
