/**
 * Currency Conversion Utility
 * 
 * Handles fetching exchange rates and converting amounts between currencies.
 */

const BASE_CURRENCY = 'IRT'; // Toman is now the reporting currency

/**
 * Fetch exchange rate from a currency to the base currency (IRT)
 * @param {string} from - Source currency code (e.g., 'EUR')
 * @returns {Promise<number>} Exchange rate (1 unit of 'from' = X units of 'base')
 */
export async function getExchangeRate(from) {
    if (from === BASE_CURRENCY) return 1.0;

    // Fixed base rate since IRT is not on standard APIs
    const USD_TO_IRT = 60000;

    try {
        // Fetch all rates relative to USD
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        
        if (from === 'USD') return USD_TO_IRT;
        
        const rateToUSD = data.rates[from]; // 1 USD = X units of 'from'
        if (rateToUSD) {
            // 1 unit of 'from' = (1 / rateToUSD) USD = (1 / rateToUSD) * USD_TO_IRT units of IRT
            return USD_TO_IRT / rateToUSD;
        }
        
        throw new Error(`Currency ${from} not found in rates`);
    } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        
        const fallbacks = {
            'USD': 60000,
            'AED': 16335,
            'EUR': 64800,
            'TRY': 1750,
            'IRT': 1.0,
            'IRR': 0.1
        };
        
        return fallbacks[from] || 1.0;
    }
}

/**
 * Convert an amount from base currency to target currency
 * @param {number} amount - Amount in base currency (USD)
 * @param {string} to - Target currency code
 * @returns {Promise<{amount: number, rate: number}>} Converted amount and rate used
 */
export async function convertFromBaseCurrency(amount, to) {
    // We fetch rate for "TO" currency relative to base (e.g., 1 EUR = 1.08 USD)
    // To convert 100 USD to EUR: 100 / 1.08 = 92.59 EUR
    const rateToUSD = await getExchangeRate(to);
    const convertedAmount = amount / rateToUSD;
    
    return {
        amount: Number(convertedAmount.toFixed(2)),
        rate: rateToUSD
    };
}

/**
 * Convert an amount to the base currency (for accounting)
 * @param {number} amount - Amount in source currency
 * @param {string} from - Source currency code
 * @returns {Promise<{amount: number, rate: number}>} Converted amount and rate used
 */
export async function convertToBaseCurrency(amount, from) {
    const rate = await getExchangeRate(from);
    return {
        amount: Number((amount * rate).toFixed(2)),
        rate: rate
    };
}
