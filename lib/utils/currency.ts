import { CURRENCIES } from '@/lib/data/locale-data';

export function getCurrencySymbol(currencyCode: string | null | undefined): string {
    if (!currencyCode) return '$';

    const currency = CURRENCIES.find(c => c.value === currencyCode);
    return currency?.symbol || currencyCode;
}

export function formatCurrency(amount: number, currencyCode: string | null | undefined): string {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
}
