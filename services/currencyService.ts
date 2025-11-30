
export interface ExchangeRates {
    [key: string]: number;
}

const API_URL = 'https://open.er-api.com/v6/latest/EUR';

export const fetchExchangeRates = async (): Promise<ExchangeRates | null> => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data && data.rates) {
            return data.rates;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        return null;
    }
};

export const convertCurrency = (
    amount: number,
    sourceCurrency: string,
    targetCurrency: string,
    rates: ExchangeRates
): number => {
    if (sourceCurrency === targetCurrency) return amount;

    const sourceRate = rates[sourceCurrency];
    const targetRate = rates[targetCurrency];

    if (!sourceRate || !targetRate) {
        console.warn(`Missing exchange rate for ${sourceCurrency} or ${targetCurrency}`);
        return amount; // Fallback to original amount if conversion fails
    }

    // Convert to EUR then to Target
    // Rate is "How much of this currency is 1 EUR"
    // e.g. EUR = 1, USD = 1.1
    // 10 USD -> EUR: 10 / 1.1 = 9.09 EUR
    // 9.09 EUR -> SEK (rate 11): 9.09 * 11 = 100 SEK

    const amountInEur = amount / sourceRate;
    return amountInEur * targetRate;
};
