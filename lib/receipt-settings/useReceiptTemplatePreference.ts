'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageTemplateType, PrintTemplateType } from '@/lib/receipt-generator';
import {
    getReceiptSettings,
    createReceiptSettings,
    updateReceiptSettings,
} from '@/lib/api/receipt-settings';

const IMAGE_TEMPLATE_ID_MAP: Record<number, ImageTemplateType> = {
    0: 'classic',
    1: 'sans-serif',
    2: 'modern-bold',
};

const IMAGE_TEMPLATE_TYPE_MAP: Record<ImageTemplateType, number> = {
    'classic': 0,
    'sans-serif': 1,
    'modern-bold': 2,
};



interface UseReceiptTemplatePreferenceProps {
    businessUuid: string | null;
}

export interface UseReceiptTemplatePreferenceResult {
    isLoading: boolean;
    error: string | null;
    imageTemplate: ImageTemplateType;
    updateImageTemplate: (newTemplate: ImageTemplateType) => Promise<void>;

    includeLogo: boolean;
    updateIncludeLogo: (value: boolean) => Promise<void>;
    footerMessage: string;
    updateFooterMessage: (value: string) => Promise<void>;
    qrcodeValue: string;
    updateQrcodeValue: (value: string) => Promise<void>;
    transactionPrefix: string;
    updateTransactionPrefix: (value: string) => Promise<void>;
    transactionNextNumber: number;
    updateTransactionNextNumber: (value: number) => Promise<void>;
    labelReceiptId: string;
    updateLabelReceiptId: (value: string) => Promise<void>;
    labelTransactionId: string;
    updateLabelTransactionId: (value: string) => Promise<void>;
    labelDate: string;
    updateLabelDate: (value: string) => Promise<void>;
    labelTime: string;
    updateLabelTime: (value: string) => Promise<void>;
    labelCashier: string;
    updateLabelCashier: (value: string) => Promise<void>;
    labelCustomer: string;
    updateLabelCustomer: (value: string) => Promise<void>;
    labelItems: string;
    updateLabelItems: (value: string) => Promise<void>;
    labelSubtotal: string;
    updateLabelSubtotal: (value: string) => Promise<void>;
    labelDiscount: string;
    updateLabelDiscount: (value: string) => Promise<void>;
    labelTax: string;
    updateLabelTax: (value: string) => Promise<void>;
    labelTotal: string;
    updateLabelTotal: (value: string) => Promise<void>;
    labelPaymentMethod: string;
    updateLabelPaymentMethod: (value: string) => Promise<void>;
    labelAmountPaid: string;
    updateLabelAmountPaid: (value: string) => Promise<void>;
    labelChange: string;
    updateLabelChange: (value: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useReceiptTemplatePreference({ businessUuid }: UseReceiptTemplatePreferenceProps): UseReceiptTemplatePreferenceResult {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isLoadingRef = useRef(false);

    const [imageTemplate, setImageTemplate] = useState<ImageTemplateType>('classic');

    const [includeLogo, setIncludeLogo] = useState<boolean>(false);
    const [footerMessage, setFooterMessage] = useState<string>('');
    const [qrcodeValue, setQrcodeValue] = useState<string>('');
    const [transactionPrefix, setTransactionPrefix] = useState<string>('');
    const [transactionNextNumber, setTransactionNextNumber] = useState<number>(1);
    const [labelReceiptId, setLabelReceiptId] = useState<string>('');
    const [labelTransactionId, setLabelTransactionId] = useState<string>('');
    const [labelDate, setLabelDate] = useState<string>('');
    const [labelTime, setLabelTime] = useState<string>('');
    const [labelCashier, setLabelCashier] = useState<string>('');
    const [labelCustomer, setLabelCustomer] = useState<string>('');
    const [labelItems, setLabelItems] = useState<string>('');
    const [labelSubtotal, setLabelSubtotal] = useState<string>('');
    const [labelDiscount, setLabelDiscount] = useState<string>('');
    const [labelTax, setLabelTax] = useState<string>('');
    const [labelTotal, setLabelTotal] = useState<string>('');
    const [labelPaymentMethod, setLabelPaymentMethod] = useState<string>('');
    const [labelAmountPaid, setLabelAmountPaid] = useState<string>('');
    const [labelChange, setLabelChange] = useState<string>('');

    const loadReceiptData = useCallback(async () => {
        if (!businessUuid || isLoadingRef.current) {
            setIsLoading(false);
            return;
        }

        try {
            isLoadingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const response = await getReceiptSettings(businessUuid);

                if (response.success && response.data) {
                    const data = response.data;
                    setImageTemplate(IMAGE_TEMPLATE_ID_MAP[data.image_template_id ?? 0] || 'classic');

                    setIncludeLogo(data.include_image);
                    setFooterMessage(data.footer_message || '');
                    setQrcodeValue(data.qrcode_data || '');
                    setTransactionPrefix(data.transaction_prefix || '');
                    setTransactionNextNumber(data.transaction_next_number);
                    setLabelReceiptId(data.label_receipt_id || '');
                    setLabelTransactionId(data.label_transaction_id || '');
                    setLabelDate(data.label_date || '');
                    setLabelTime(data.label_time || '');
                    setLabelCashier(data.label_cashier || '');
                    setLabelCustomer(data.label_customer || '');
                    setLabelItems(data.label_items || '');
                    setLabelSubtotal(data.label_subtotal || '');
                    setLabelDiscount(data.label_discount || '');
                    setLabelTax(data.label_tax || '');
                    setLabelTotal(data.label_total || '');
                    setLabelPaymentMethod(data.label_payment_method || '');
                    setLabelAmountPaid(data.label_amount_paid || '');
                    setLabelChange(data.label_change || '');
                }
            } catch (error: unknown) {
                if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
                    const createResponse = await createReceiptSettings(businessUuid, {
                        image_template_id: 0,

                        include_image: false,
                        footer_message: '',
                        qrcode_data: '',
                        transaction_prefix: 'INV',
                        transaction_next_number: 1,
                    });

                    if (createResponse.success && createResponse.data) {
                        const data = createResponse.data;
                        setImageTemplate(IMAGE_TEMPLATE_ID_MAP[data.image_template_id ?? 0] || 'classic');

                        setIncludeLogo(data.include_image);
                        setFooterMessage(data.footer_message || '');
                        setQrcodeValue(data.qrcode_data || '');
                        setTransactionPrefix(data.transaction_prefix || '');
                        setTransactionNextNumber(data.transaction_next_number);
                        setLabelReceiptId(data.label_receipt_id || '');
                        setLabelTransactionId(data.label_transaction_id || '');
                        setLabelDate(data.label_date || '');
                        setLabelTime(data.label_time || '');
                        setLabelCashier(data.label_cashier || '');
                        setLabelCustomer(data.label_customer || '');
                        setLabelItems(data.label_items || '');
                        setLabelSubtotal(data.label_subtotal || '');
                        setLabelDiscount(data.label_discount || '');
                        setLabelTax(data.label_tax || '');
                        setLabelTotal(data.label_total || '');
                        setLabelPaymentMethod(data.label_payment_method || '');
                        setLabelAmountPaid(data.label_amount_paid || '');
                        setLabelChange(data.label_change || '');
                    } else {
                        setError('Failed to create receipt data');
                    }
                } else {
                    throw error;
                }
            }
        } catch (err) {
            console.error('Error loading receipt data:', err);
            setError('Failed to load receipt settings');
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [businessUuid]);

    useEffect(() => {
        loadReceiptData();
    }, [loadReceiptData]);

    const updateImageTemplate = async (newTemplate: ImageTemplateType) => {
        if (!businessUuid) return;

        setImageTemplate(newTemplate);

        try {
            await updateReceiptSettings(businessUuid, {
                image_template_id: IMAGE_TEMPLATE_TYPE_MAP[newTemplate],
            });
        } catch (err) {
            console.error('Error updating image template:', err);
            setError('Failed to update image template');
        }
    };



    const updateIncludeLogo = async (value: boolean) => {
        if (!businessUuid) return;

        setIncludeLogo(value);

        try {
            await updateReceiptSettings(businessUuid, {
                include_image: value,
            });
        } catch (err) {
            console.error('Error updating include logo:', err);
            setError('Failed to update logo setting');
        }
    };

    const updateFooterMessage = async (value: string) => {
        if (!businessUuid) return;

        setFooterMessage(value);

        try {
            await updateReceiptSettings(businessUuid, {
                footer_message: value || null,
            });
        } catch (err) {
            console.error('Error updating footer message:', err);
            setError('Failed to update footer message');
        }
    };

    const updateQrcodeValue = async (value: string) => {
        if (!businessUuid) return;

        setQrcodeValue(value);

        try {
            await updateReceiptSettings(businessUuid, {
                qrcode_data: value || null,
            });
        } catch (err) {
            console.error('Error updating QR code:', err);
            setError('Failed to update QR code');
        }
    };

    const updateTransactionPrefix = async (value: string) => {
        if (!businessUuid) return;

        setTransactionPrefix(value);

        try {
            await updateReceiptSettings(businessUuid, {
                transaction_prefix: value || null,
            });
        } catch (err) {
            console.error('Error updating transaction prefix:', err);
            setError('Failed to update transaction prefix');
        }
    };

    const updateTransactionNextNumber = async (value: number) => {
        if (!businessUuid) return;

        setTransactionNextNumber(value);

        try {
            await updateReceiptSettings(businessUuid, {
                transaction_next_number: value,
            });
        } catch (err) {
            console.error('Error updating transaction number:', err);
            setError('Failed to update transaction number');
        }
    };

    const updateLabelReceiptId = async (value: string) => {
        if (!businessUuid) return;
        setLabelReceiptId(value);
        try {
            await updateReceiptSettings(businessUuid, { label_receipt_id: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelTransactionId = async (value: string) => {
        if (!businessUuid) return;
        setLabelTransactionId(value);
        try {
            await updateReceiptSettings(businessUuid, { label_transaction_id: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelDate = async (value: string) => {
        if (!businessUuid) return;
        setLabelDate(value);
        try {
            await updateReceiptSettings(businessUuid, { label_date: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelTime = async (value: string) => {
        if (!businessUuid) return;
        setLabelTime(value);
        try {
            await updateReceiptSettings(businessUuid, { label_time: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelCashier = async (value: string) => {
        if (!businessUuid) return;
        setLabelCashier(value);
        try {
            await updateReceiptSettings(businessUuid, { label_cashier: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelCustomer = async (value: string) => {
        if (!businessUuid) return;
        setLabelCustomer(value);
        try {
            await updateReceiptSettings(businessUuid, { label_customer: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelItems = async (value: string) => {
        if (!businessUuid) return;
        setLabelItems(value);
        try {
            await updateReceiptSettings(businessUuid, { label_items: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelSubtotal = async (value: string) => {
        if (!businessUuid) return;
        setLabelSubtotal(value);
        try {
            await updateReceiptSettings(businessUuid, { label_subtotal: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelDiscount = async (value: string) => {
        if (!businessUuid) return;
        setLabelDiscount(value);
        try {
            await updateReceiptSettings(businessUuid, { label_discount: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelTax = async (value: string) => {
        if (!businessUuid) return;
        setLabelTax(value);
        try {
            await updateReceiptSettings(businessUuid, { label_tax: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelTotal = async (value: string) => {
        if (!businessUuid) return;
        setLabelTotal(value);
        try {
            await updateReceiptSettings(businessUuid, { label_total: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelPaymentMethod = async (value: string) => {
        if (!businessUuid) return;
        setLabelPaymentMethod(value);
        try {
            await updateReceiptSettings(businessUuid, { label_payment_method: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelAmountPaid = async (value: string) => {
        if (!businessUuid) return;
        setLabelAmountPaid(value);
        try {
            await updateReceiptSettings(businessUuid, { label_amount_paid: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    const updateLabelChange = async (value: string) => {
        if (!businessUuid) return;
        setLabelChange(value);
        try {
            await updateReceiptSettings(businessUuid, { label_change: value || null });
        } catch (err) {
            console.error('Error updating label:', err);
        }
    };

    return {
        isLoading,
        error,
        imageTemplate,
        updateImageTemplate,

        includeLogo,
        updateIncludeLogo,
        footerMessage,
        updateFooterMessage,
        qrcodeValue,
        updateQrcodeValue,
        transactionPrefix,
        updateTransactionPrefix,
        transactionNextNumber,
        updateTransactionNextNumber,
        labelReceiptId,
        updateLabelReceiptId,
        labelTransactionId,
        updateLabelTransactionId,
        labelDate,
        updateLabelDate,
        labelTime,
        updateLabelTime,
        labelCashier,
        updateLabelCashier,
        labelCustomer,
        updateLabelCustomer,
        labelItems,
        updateLabelItems,
        labelSubtotal,
        updateLabelSubtotal,
        labelDiscount,
        updateLabelDiscount,
        labelTax,
        updateLabelTax,
        labelTotal,
        updateLabelTotal,
        labelPaymentMethod,
        updateLabelPaymentMethod,
        labelAmountPaid,
        updateLabelAmountPaid,
        labelChange,
        updateLabelChange,
        refetch: async () => { await loadReceiptData(); },
    };
}
