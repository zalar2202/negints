import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function fixInvoices() {
    try {
        const { default: dbConnect } = await import('../src/lib/mongodb.js');
        const { default: Invoice } = await import('../src/models/Invoice.js');
        const { default: Payment } = await import('../src/models/Payment.js');
        const { getExchangeRate } = await import('../src/lib/currency.js');

        await dbConnect();
        console.log('Connected to database.');

        // 1. Find AED invoices that might be wrongly calculated
        const aedInvoices = await Invoice.find({ currency: 'AED' });
        console.log(`Found ${aedInvoices.length} AED invoices.`);

        const rate = await getExchangeRate('AED');
        console.log(`Current AED to USD rate: ${rate}`);

        for (const inv of aedInvoices) {
            console.log(`Processing ${inv.invoiceNumber}...`);
            
            const totalInBase = Number((inv.total * rate).toFixed(2));
            
            // Update invoice calculation
            inv.exchangeRate = rate;
            inv.totalInBaseCurrency = totalInBase;
            inv.baseCurrency = inv.baseCurrency || 'USD';
            await inv.save();
            console.log(`Updated ${inv.invoiceNumber}: totalInBaseCurrency = ${totalInBase}`);

            // 2. Create missing payment records for paid invoices
            if (inv.status === 'paid') {
                const existingPayment = await Payment.findOne({ invoice: inv._id });
                if (!existingPayment) {
                    await Payment.create({
                        client: inv.client,
                        invoice: inv._id,
                        amount: inv.total,
                        currency: inv.currency,
                        amountInBaseCurrency: totalInBase,
                        exchangeRate: rate,
                        method: inv.paymentMethod || 'bank_transfer',
                        status: 'completed',
                        paymentDate: inv.issueDate,
                        notes: `Automatically recovery record from Invoice ${inv.invoiceNumber}`
                    });
                    console.log(`Created missing payment for ${inv.invoiceNumber}`);
                }
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixInvoices();
