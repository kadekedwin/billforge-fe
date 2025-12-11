export const LIMITS = {
    MAX_BUSINESSES: 1,
    MAX_ITEMS: 50,
    MAX_CATEGORIES: 30,
    MAX_DISCOUNTS: 30,
    MAX_TAXES: 30,
    MAX_TRANSACTIONS_MONTHLY: 50,
    MAX_PAYMENT_METHODS: 5,
    MAX_CUSTOMERS: 50,
} as const;

export type LimitType = keyof typeof LIMITS;

export const getLimitMessage = (limitType: LimitType): string => {
    const messages: Record<LimitType, string> = {
        MAX_BUSINESSES: `You have reached the maximum limit of ${LIMITS.MAX_BUSINESSES} businesses.`,
        MAX_ITEMS: `You have reached the maximum limit of ${LIMITS.MAX_ITEMS} items per business.`,
        MAX_CATEGORIES: `You have reached the maximum limit of ${LIMITS.MAX_CATEGORIES} categories per business.`,
        MAX_DISCOUNTS: `You have reached the maximum limit of ${LIMITS.MAX_DISCOUNTS} discounts per business.`,
        MAX_TAXES: `You have reached the maximum limit of ${LIMITS.MAX_TAXES} taxes per business.`,
        MAX_TRANSACTIONS_MONTHLY: `You have reached the maximum limit of ${LIMITS.MAX_TRANSACTIONS_MONTHLY} transactions per month.`,
        MAX_PAYMENT_METHODS: `You have reached the maximum limit of ${LIMITS.MAX_PAYMENT_METHODS} payment methods per business.`,
        MAX_CUSTOMERS: `You have reached the maximum limit of ${LIMITS.MAX_CUSTOMERS} customers per business.`,
    };

    return messages[limitType];
};

