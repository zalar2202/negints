import axios from 'axios';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

const ENV_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
const ENV_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true';

async function getZarinpalConfig() {
    await dbConnect();
    const setting = await Setting.findOne({ key: "payment_zarinpal" });
    const config = setting?.value || {};
    
    // Fallback to env if not in DB, for backward compatibility
    return {
        merchantId: config.merchantId || ENV_MERCHANT_ID,
        isSandbox: config.isSandbox !== undefined ? config.isSandbox : ENV_SANDBOX,
        isEnabled: config.isEnabled !== undefined ? config.isEnabled : true // Default to true if not specified
    };
}

/**
 * Request a payment from Zarinpal
 * @param {number} amount - Amount in TOMAN
 * @param {string} description - Transaction description
 * @param {string} callbackUrl - Where to redirect after payment
 * @param {Object} metadata - Optional (mobile, email, etc)
 */
export async function requestPayment({ amount, description, callbackUrl, metadata = {} }) {
    try {
        const config = await getZarinpalConfig();

        if (!config.isEnabled) {
            return {
                success: false,
                message: 'Payment gateway is currently disabled.'
            };
        }

        const baseUrl = config.isSandbox 
            ? 'https://sandbox.zarinpal.com/pg/v4/payment' 
            : 'https://payment.zarinpal.com/pg/v4/payment';

        const startPayUrl = config.isSandbox
            ? 'https://sandbox.zarinpal.com/pg/StartPay/'
            : 'https://www.zarinpal.com/pg/StartPay/';

        const requestData = {
            merchant_id: config.merchantId,
            amount: Math.round(amount * 10), // Convert Toman to Rial
            description,
            callback_url: callbackUrl,
        };

        // Only include metadata if we have actual values to avoid Zarinpal validation issues
        const zarinMetadata = {};
        if (metadata.mobile) zarinMetadata.mobile = String(metadata.mobile).trim();
        if (metadata.email) zarinMetadata.email = String(metadata.email).trim();
        
        if (Object.keys(zarinMetadata).length > 0) {
            requestData.metadata = zarinMetadata;
        }

        const response = await axios.post(`${baseUrl}/request.json`, requestData, {
            timeout: 10000 // 10 second timeout
        });

        if (response.data.data && response.data.data.code === 100) {
            return {
                success: true,
                authority: response.data.data.authority,
                paymentUrl: `${startPayUrl}${response.data.data.authority}`
            };
        }

        return {
            success: false,
            message: response.data.errors?.message || `Zarinpal rejected request (Code: ${response.data.errors?.code || 'Unknown'})`,
            code: response.data.errors?.code
        };
    } catch (error) {
        console.error('Zarinpal Request Error Details:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.errors?.message || error.message;
        return {
            success: false,
            message: `Zarinpal Connection Error: ${errorMsg}`
        };
    }
}

/**
 * Verify a payment from Zarinpal
 * @param {number} amount - Amount in TOMAN
 * @param {string} authority - Authority code from Zarinpal
 */
export async function verifyPayment(amount, authority) {
    try {
        const config = await getZarinpalConfig();
        
        const baseUrl = config.isSandbox 
            ? 'https://sandbox.zarinpal.com/pg/v4/payment' 
            : 'https://payment.zarinpal.com/pg/v4/payment';

        const response = await axios.post(`${baseUrl}/verify.json`, {
            merchant_id: config.merchantId,
            amount: amount,
            authority: authority
        });

        if (response.data.data && (response.data.data.code === 100 || response.data.data.code === 101)) {
            return {
                success: true,
                refId: response.data.data.ref_id,
                code: response.data.data.code
            };
        }

        return {
            success: false,
            message: response.data.errors?.message || 'Zarinpal verification failed',
            code: response.data.errors?.code
        };
    } catch (error) {
        console.error('Zarinpal Verify Error:', error.response?.data || error.message);
        return {
            success: false,
            message: 'Internal error verifying Zarinpal payment'
        };
    }
}
