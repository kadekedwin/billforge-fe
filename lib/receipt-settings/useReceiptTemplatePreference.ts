'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageTemplateType } from '@/lib/receipt-generator';
import {
    getReceiptSettings,
    createReceiptSettings,
    updateReceiptSettings,
} from '@/lib/api/receipt-settings';

const RECEIPT_STYLE_ID_MAP: Record<number, ImageTemplateType> = {
    0: 'classic',
    1: 'sans-serif',
};

const RECEIPT_STYLE_TYPE_MAP: Record<ImageTemplateType, number> = {
    'classic': 0,
    'sans-serif': 1,
};

interface UseReceiptTemplatePreferenceProps {
    businessUuid: string | null;
}

export interface UseReceiptTemplatePreferenceResult {
    isLoading: boolean;
    error: string | null;
    receiptStyle: ImageTemplateType;
    updateReceiptStyle: (newStyle: ImageTemplateType) => Promise<void>;

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

    font: string;
    updateFont: (value: string) => Promise<void>;
    lineCharacter: string;
    updateLineCharacter: (value: string) => Promise<void>;
    itemLayout: number;
    updateItemLayout: (value: number) => Promise<void>;

    labelReceiptId: string;
    updateLabelReceiptId: (value: string) => Promise<void>;
    labelReceiptIdEnabled: boolean;
    updateLabelReceiptIdEnabled: (value: boolean) => Promise<void>;
    labelTransactionId: string;
    updateLabelTransactionId: (value: string) => Promise<void>;
    labelTransactionIdEnabled: boolean;
    updateLabelTransactionIdEnabled: (value: boolean) => Promise<void>;
    labelDate: string;
    updateLabelDate: (value: string) => Promise<void>;
    labelDateEnabled: boolean;
    updateLabelDateEnabled: (value: boolean) => Promise<void>;
    labelTime: string;
    updateLabelTime: (value: string) => Promise<void>;
    labelTimeEnabled: boolean;
    updateLabelTimeEnabled: (value: boolean) => Promise<void>;
    labelCashier: string;
    updateLabelCashier: (value: string) => Promise<void>;
    labelCashierEnabled: boolean;
    updateLabelCashierEnabled: (value: boolean) => Promise<void>;
    labelCustomer: string;
    updateLabelCustomer: (value: string) => Promise<void>;
    labelCustomerEnabled: boolean;
    updateLabelCustomerEnabled: (value: boolean) => Promise<void>;
    labelItems: string;
    updateLabelItems: (value: string) => Promise<void>;
    labelItemsEnabled: boolean;
    updateLabelItemsEnabled: (value: boolean) => Promise<void>;
    labelSubtotal: string;
    updateLabelSubtotal: (value: string) => Promise<void>;
    labelSubtotalEnabled: boolean;
    updateLabelSubtotalEnabled: (value: boolean) => Promise<void>;
    labelDiscount: string;
    updateLabelDiscount: (value: string) => Promise<void>;
    labelDiscountEnabled: boolean;
    updateLabelDiscountEnabled: (value: boolean) => Promise<void>;
    labelTax: string;
    updateLabelTax: (value: string) => Promise<void>;
    labelTaxEnabled: boolean;
    updateLabelTaxEnabled: (value: boolean) => Promise<void>;
    labelTotal: string;
    updateLabelTotal: (value: string) => Promise<void>;
    labelTotalEnabled: boolean;
    updateLabelTotalEnabled: (value: boolean) => Promise<void>;
    labelPaymentMethod: string;
    updateLabelPaymentMethod: (value: string) => Promise<void>;
    labelPaymentMethodEnabled: boolean;
    updateLabelPaymentMethodEnabled: (value: boolean) => Promise<void>;
    labelAmountPaid: string;
    updateLabelAmountPaid: (value: string) => Promise<void>;
    labelAmountPaidEnabled: boolean;
    updateLabelAmountPaidEnabled: (value: boolean) => Promise<void>;
    labelChange: string;
    updateLabelChange: (value: string) => Promise<void>;
    labelChangeEnabled: boolean;
    updateLabelChangeEnabled: (value: boolean) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useReceiptTemplatePreference({ businessUuid }: UseReceiptTemplatePreferenceProps): UseReceiptTemplatePreferenceResult {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isLoadingRef = useRef(false);

    const [receiptStyle, setReceiptStyle] = useState<ImageTemplateType>('classic');

    const [includeLogo, setIncludeLogo] = useState<boolean>(false);
    const [footerMessage, setFooterMessage] = useState<string>('');
    const [qrcodeValue, setQrcodeValue] = useState<string>('');
    const [transactionPrefix, setTransactionPrefix] = useState<string>('');
    const [transactionNextNumber, setTransactionNextNumber] = useState<number>(1);

    const [font, setFont] = useState<string>('');
    const [lineCharacter, setLineCharacter] = useState<string>('');
    const [itemLayout, setItemLayout] = useState<number>(0);

    const [labelReceiptId, setLabelReceiptId] = useState<string>('');
    const [labelReceiptIdEnabled, setLabelReceiptIdEnabled] = useState<boolean>(true);
    const [labelTransactionId, setLabelTransactionId] = useState<string>('');
    const [labelTransactionIdEnabled, setLabelTransactionIdEnabled] = useState<boolean>(true);
    const [labelDate, setLabelDate] = useState<string>('');
    const [labelDateEnabled, setLabelDateEnabled] = useState<boolean>(true);
    const [labelTime, setLabelTime] = useState<string>('');
    const [labelTimeEnabled, setLabelTimeEnabled] = useState<boolean>(true);
    const [labelCashier, setLabelCashier] = useState<string>('');
    const [labelCashierEnabled, setLabelCashierEnabled] = useState<boolean>(true);
    const [labelCustomer, setLabelCustomer] = useState<string>('');
    const [labelCustomerEnabled, setLabelCustomerEnabled] = useState<boolean>(true);
    const [labelItems, setLabelItems] = useState<string>('');
    const [labelItemsEnabled, setLabelItemsEnabled] = useState<boolean>(true);
    const [labelSubtotal, setLabelSubtotal] = useState<string>('');
    const [labelSubtotalEnabled, setLabelSubtotalEnabled] = useState<boolean>(true);
    const [labelDiscount, setLabelDiscount] = useState<string>('');
    const [labelDiscountEnabled, setLabelDiscountEnabled] = useState<boolean>(true);
    const [labelTax, setLabelTax] = useState<string>('');
    const [labelTaxEnabled, setLabelTaxEnabled] = useState<boolean>(true);
    const [labelTotal, setLabelTotal] = useState<string>('');
    const [labelTotalEnabled, setLabelTotalEnabled] = useState<boolean>(true);
    const [labelPaymentMethod, setLabelPaymentMethod] = useState<string>('');
    const [labelPaymentMethodEnabled, setLabelPaymentMethodEnabled] = useState<boolean>(true);
    const [labelAmountPaid, setLabelAmountPaid] = useState<string>('');
    const [labelAmountPaidEnabled, setLabelAmountPaidEnabled] = useState<boolean>(true);
    const [labelChange, setLabelChange] = useState<string>('');
    const [labelChangeEnabled, setLabelChangeEnabled] = useState<boolean>(true);

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
                    setReceiptStyle(RECEIPT_STYLE_ID_MAP[data.receipt_style_id ?? 0] || 'classic');

                    setIncludeLogo(data.include_image);
                    setFooterMessage(data.footer_message || '');
                    setQrcodeValue(data.qrcode_data || '');
                    setTransactionPrefix(data.transaction_prefix || '');
                    setTransactionNextNumber(data.transaction_next_number);

                    setFont(data.font || '');
                    setLineCharacter(data.line_character || '');
                    setItemLayout(Number(data.item_layout ?? 0));

                    setLabelReceiptId(data.label_receipt_id || '');
                    setLabelReceiptIdEnabled(data.label_receipt_id_enabled ?? true);
                    setLabelTransactionId(data.label_transaction_id || '');
                    setLabelTransactionIdEnabled(data.label_transaction_id_enabled ?? true);
                    setLabelDate(data.label_date || '');
                    setLabelDateEnabled(data.label_date_enabled ?? true);
                    setLabelTime(data.label_time || '');
                    setLabelTimeEnabled(data.label_time_enabled ?? true);
                    setLabelCashier(data.label_cashier || '');
                    setLabelCashierEnabled(data.label_cashier_enabled ?? true);
                    setLabelCustomer(data.label_customer || '');
                    setLabelCustomerEnabled(data.label_customer_enabled ?? true);
                    setLabelItems(data.label_items || '');
                    setLabelItemsEnabled(data.label_items_enabled ?? true);
                    setLabelSubtotal(data.label_subtotal || '');
                    setLabelSubtotalEnabled(data.label_subtotal_enabled ?? true);
                    setLabelDiscount(data.label_discount || '');
                    setLabelDiscountEnabled(data.label_discount_enabled ?? true);
                    setLabelTax(data.label_tax || '');
                    setLabelTaxEnabled(data.label_tax_enabled ?? true);
                    setLabelTotal(data.label_total || '');
                    setLabelTotalEnabled(data.label_total_enabled ?? true);
                    setLabelPaymentMethod(data.label_payment_method || '');
                    setLabelPaymentMethodEnabled(data.label_payment_method_enabled ?? true);
                    setLabelAmountPaid(data.label_amount_paid || '');
                    setLabelAmountPaidEnabled(data.label_amount_paid_enabled ?? true);
                    setLabelChange(data.label_change || '');
                    setLabelChangeEnabled(data.label_change_enabled ?? true);
                }
            } catch (error: unknown) {
                if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
                    const createResponse = await createReceiptSettings(businessUuid, {
                        receipt_style_id: 0,
                        include_image: false,
                        footer_message: '',
                        qrcode_data: '',
                        transaction_prefix: 'INV',
                        transaction_next_number: 1,
                    });

                    if (createResponse.success && createResponse.data) {
                        const data = createResponse.data;
                        setReceiptStyle(RECEIPT_STYLE_ID_MAP[data.receipt_style_id ?? 0] || 'classic');

                        setIncludeLogo(data.include_image);
                        setFooterMessage(data.footer_message || '');
                        setQrcodeValue(data.qrcode_data || '');
                        setTransactionPrefix(data.transaction_prefix || '');
                        setTransactionNextNumber(data.transaction_next_number);

                        setFont(data.font || '');
                        setLineCharacter(data.line_character || '');
                        setItemLayout(Number(data.item_layout ?? 0));

                        setLabelReceiptId(data.label_receipt_id || '');
                        setLabelReceiptIdEnabled(data.label_receipt_id_enabled ?? true);
                        setLabelTransactionId(data.label_transaction_id || '');
                        setLabelTransactionIdEnabled(data.label_transaction_id_enabled ?? true);
                        setLabelDate(data.label_date || '');
                        setLabelDateEnabled(data.label_date_enabled ?? true);
                        setLabelTime(data.label_time || '');
                        setLabelTimeEnabled(data.label_time_enabled ?? true);
                        setLabelCashier(data.label_cashier || '');
                        setLabelCashierEnabled(data.label_cashier_enabled ?? true);
                        setLabelCustomer(data.label_customer || '');
                        setLabelCustomerEnabled(data.label_customer_enabled ?? true);
                        setLabelItems(data.label_items || '');
                        setLabelItemsEnabled(data.label_items_enabled ?? true);
                        setLabelSubtotal(data.label_subtotal || '');
                        setLabelSubtotalEnabled(data.label_subtotal_enabled ?? true);
                        setLabelDiscount(data.label_discount || '');
                        setLabelDiscountEnabled(data.label_discount_enabled ?? true);
                        setLabelTax(data.label_tax || '');
                        setLabelTaxEnabled(data.label_tax_enabled ?? true);
                        setLabelTotal(data.label_total || '');
                        setLabelTotalEnabled(data.label_total_enabled ?? true);
                        setLabelPaymentMethod(data.label_payment_method || '');
                        setLabelPaymentMethodEnabled(data.label_payment_method_enabled ?? true);
                        setLabelAmountPaid(data.label_amount_paid || '');
                        setLabelAmountPaidEnabled(data.label_amount_paid_enabled ?? true);
                        setLabelChange(data.label_change || '');
                        setLabelChangeEnabled(data.label_change_enabled ?? true);
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

    const updateReceiptStyle = async (newStyle: ImageTemplateType) => {
        if (!businessUuid) return;
        setReceiptStyle(newStyle);
        try {
            await updateReceiptSettings(businessUuid, {
                receipt_style_id: RECEIPT_STYLE_TYPE_MAP[newStyle],
            });
        } catch (err) {
            console.error('Error updating receipt style:', err);
            setError('Failed to update receipt style');
        }
    };

    const updateIncludeLogo = async (value: boolean) => {
        if (!businessUuid) return;
        setIncludeLogo(value);
        try {
            await updateReceiptSettings(businessUuid, { include_image: value });
        } catch (err) {
            console.error('Error updating include logo:', err);
            setError('Failed to update logo setting');
        }
    };

    const updateFooterMessage = async (value: string) => {
        if (!businessUuid) return;
        setFooterMessage(value);
        try {
            await updateReceiptSettings(businessUuid, { footer_message: value || null });
        } catch (err) {
            console.error('Error updating footer message:', err);
            setError('Failed to update footer message');
        }
    };

    const updateQrcodeValue = async (value: string) => {
        if (!businessUuid) return;
        setQrcodeValue(value);
        try {
            await updateReceiptSettings(businessUuid, { qrcode_data: value || null });
        } catch (err) {
            console.error('Error updating QR code:', err);
            setError('Failed to update QR code');
        }
    };

    const updateTransactionPrefix = async (value: string) => {
        if (!businessUuid) return;
        setTransactionPrefix(value);
        try {
            await updateReceiptSettings(businessUuid, { transaction_prefix: value || null });
        } catch (err) {
            console.error('Error updating transaction prefix:', err);
            setError('Failed to update transaction prefix');
        }
    };

    const updateTransactionNextNumber = async (value: number) => {
        if (!businessUuid) return;
        setTransactionNextNumber(value);
        try {
            await updateReceiptSettings(businessUuid, { transaction_next_number: value });
        } catch (err) {
            console.error('Error updating transaction number:', err);
            setError('Failed to update transaction number');
        }
    };

    const updateFont = async (value: string) => {
        if (!businessUuid) return;
        setFont(value);
        try {
            await updateReceiptSettings(businessUuid, { font: value || null });
        } catch (err) {
            console.error('Error updating font:', err);
            setError('Failed to update font');
        }
    };

    const updateLineCharacter = async (value: string) => {
        if (!businessUuid) return;
        setLineCharacter(value);
        try {
            await updateReceiptSettings(businessUuid, { line_character: value || null });
        } catch (err) {
            console.error('Error updating line character:', err);
            setError('Failed to update line character');
        }
    };

    const updateItemLayout = async (value: number) => {
        if (!businessUuid) return;
        setItemLayout(value);
        try {
            await updateReceiptSettings(businessUuid, { item_layout: value });
        } catch (err) {
            console.error('Error updating item layout:', err);
            setError('Failed to update item layout');
        }
    };

    const createUpdateLabelFunction = (
        setter: (val: string) => void,
        field: keyof Omit<import('@/lib/api/receipt-settings/types').UpdateReceiptSettingsRequest, 'business_uuid'>
    ) => async (value: string) => {
        if (!businessUuid) return;
        setter(value);
        try {
            await updateReceiptSettings(businessUuid, { [field]: value || null });
        } catch (err) {
            console.error(`Error updating ${String(field)}:`, err);
        }
    };

    const createUpdateEnabledFunction = (
        setter: (val: boolean) => void,
        field: keyof Omit<import('@/lib/api/receipt-settings/types').UpdateReceiptSettingsRequest, 'business_uuid'>
    ) => async (value: boolean) => {
        if (!businessUuid) return;
        setter(value);
        try {
            await updateReceiptSettings(businessUuid, { [field]: value });
        } catch (err) {
            console.error(`Error updating ${String(field)}:`, err);
        }
    };

    return {
        isLoading,
        error,
        receiptStyle,
        updateReceiptStyle,
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

        font,
        updateFont,
        lineCharacter,
        updateLineCharacter,
        itemLayout,
        updateItemLayout,

        labelReceiptId,
        updateLabelReceiptId: createUpdateLabelFunction(setLabelReceiptId, 'label_receipt_id'),
        labelReceiptIdEnabled,
        updateLabelReceiptIdEnabled: createUpdateEnabledFunction(setLabelReceiptIdEnabled, 'label_receipt_id_enabled'),

        labelTransactionId,
        updateLabelTransactionId: createUpdateLabelFunction(setLabelTransactionId, 'label_transaction_id'),
        labelTransactionIdEnabled,
        updateLabelTransactionIdEnabled: createUpdateEnabledFunction(setLabelTransactionIdEnabled, 'label_transaction_id_enabled'),

        labelDate,
        updateLabelDate: createUpdateLabelFunction(setLabelDate, 'label_date'),
        labelDateEnabled,
        updateLabelDateEnabled: createUpdateEnabledFunction(setLabelDateEnabled, 'label_date_enabled'),

        labelTime,
        updateLabelTime: createUpdateLabelFunction(setLabelTime, 'label_time'),
        labelTimeEnabled,
        updateLabelTimeEnabled: createUpdateEnabledFunction(setLabelTimeEnabled, 'label_time_enabled'),

        labelCashier,
        updateLabelCashier: createUpdateLabelFunction(setLabelCashier, 'label_cashier'),
        labelCashierEnabled,
        updateLabelCashierEnabled: createUpdateEnabledFunction(setLabelCashierEnabled, 'label_cashier_enabled'),

        labelCustomer,
        updateLabelCustomer: createUpdateLabelFunction(setLabelCustomer, 'label_customer'),
        labelCustomerEnabled,
        updateLabelCustomerEnabled: createUpdateEnabledFunction(setLabelCustomerEnabled, 'label_customer_enabled'),

        labelItems,
        updateLabelItems: createUpdateLabelFunction(setLabelItems, 'label_items'),
        labelItemsEnabled,
        updateLabelItemsEnabled: createUpdateEnabledFunction(setLabelItemsEnabled, 'label_items_enabled'),

        labelSubtotal,
        updateLabelSubtotal: createUpdateLabelFunction(setLabelSubtotal, 'label_subtotal'),
        labelSubtotalEnabled,
        updateLabelSubtotalEnabled: createUpdateEnabledFunction(setLabelSubtotalEnabled, 'label_subtotal_enabled'),

        labelDiscount,
        updateLabelDiscount: createUpdateLabelFunction(setLabelDiscount, 'label_discount'),
        labelDiscountEnabled,
        updateLabelDiscountEnabled: createUpdateEnabledFunction(setLabelDiscountEnabled, 'label_discount_enabled'),

        labelTax,
        updateLabelTax: createUpdateLabelFunction(setLabelTax, 'label_tax'),
        labelTaxEnabled,
        updateLabelTaxEnabled: createUpdateEnabledFunction(setLabelTaxEnabled, 'label_tax_enabled'),

        labelTotal,
        updateLabelTotal: createUpdateLabelFunction(setLabelTotal, 'label_total'),
        labelTotalEnabled,
        updateLabelTotalEnabled: createUpdateEnabledFunction(setLabelTotalEnabled, 'label_total_enabled'),

        labelPaymentMethod,
        updateLabelPaymentMethod: createUpdateLabelFunction(setLabelPaymentMethod, 'label_payment_method'),
        labelPaymentMethodEnabled,
        updateLabelPaymentMethodEnabled: createUpdateEnabledFunction(setLabelPaymentMethodEnabled, 'label_payment_method_enabled'),

        labelAmountPaid,
        updateLabelAmountPaid: createUpdateLabelFunction(setLabelAmountPaid, 'label_amount_paid'),
        labelAmountPaidEnabled,
        updateLabelAmountPaidEnabled: createUpdateEnabledFunction(setLabelAmountPaidEnabled, 'label_amount_paid_enabled'),

        labelChange,
        updateLabelChange: createUpdateLabelFunction(setLabelChange, 'label_change'),
        labelChangeEnabled,
        updateLabelChangeEnabled: createUpdateEnabledFunction(setLabelChangeEnabled, 'label_change_enabled'),

        refetch: async () => { await loadReceiptData(); },
    };
}
