'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReceiptTemplateType } from '@/lib/receipt';
import {
    getReceiptData,
    createReceiptData,
    updateReceiptData,
} from '@/lib/api/receipt-data';

const TEMPLATE_ID_MAP: Record<number, ReceiptTemplateType> = {
    0: 'classic',
    1: 'sans-serif',
    2: 'modern-bold',
};

const TEMPLATE_TYPE_MAP: Record<ReceiptTemplateType, number> = {
    'classic': 0,
    'sans-serif': 1,
    'modern-bold': 2,
};

interface UseReceiptTemplatePreferenceProps {
    businessUuid: string | null;
}

export function useReceiptTemplatePreference({ businessUuid }: UseReceiptTemplatePreferenceProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [template, setTemplate] = useState<ReceiptTemplateType>('classic');
    const [includeLogo, setIncludeLogo] = useState<boolean>(false);
    const [footerMessage, setFooterMessage] = useState<string>('');
    const [qrcodeValue, setQrcodeValue] = useState<string>('');
    const [transactionPrefix, setTransactionPrefix] = useState<string>('');
    const [transactionNextNumber, setTransactionNextNumber] = useState<number>(1);

    const loadReceiptData = useCallback(async () => {
        if (!businessUuid) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await getReceiptData(businessUuid);

            if (response.success && response.data) {

                const data = response.data;
                setTemplate(TEMPLATE_ID_MAP[data.template_id] || 'classic');
                setIncludeLogo(data.include_image);
                setFooterMessage(data.footer_message || '');
                setQrcodeValue(data.qrcode_data || '');
                setTransactionPrefix(data.transaction_prefix || '');
                setTransactionNextNumber(data.transaction_next_number);
            } else {

                const createResponse = await createReceiptData(businessUuid, {
                    template_id: 0,
                    include_image: false,
                    footer_message: '',
                    qrcode_data: '',
                    transaction_prefix: 'INV',
                    transaction_next_number: 1,
                });

                if (createResponse.success) {
                    setTemplate('classic');
                    setIncludeLogo(false);
                    setFooterMessage('');
                    setQrcodeValue('');
                    setTransactionPrefix('INV');
                    setTransactionNextNumber(1);
                } else {
                    setError('Failed to create receipt data');
                }
            }
        } catch (err) {
            console.error('Error loading receipt data:', err);
            setError('Failed to load receipt settings');
        } finally {
            setIsLoading(false);
        }
    }, [businessUuid]);

    useEffect(() => {
        loadReceiptData();
    }, [loadReceiptData]);

    const updateTemplate = async (newTemplate: ReceiptTemplateType) => {
        if (!businessUuid) return;

        setTemplate(newTemplate);

        try {
            await updateReceiptData(businessUuid, {
                template_id: TEMPLATE_TYPE_MAP[newTemplate],
            });
        } catch (err) {
            console.error('Error updating template:', err);
            setError('Failed to update template');
        }
    };

    const updateIncludeLogo = async (value: boolean) => {
        if (!businessUuid) return;

        setIncludeLogo(value);

        try {
            await updateReceiptData(businessUuid, {
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
            await updateReceiptData(businessUuid, {
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
            await updateReceiptData(businessUuid, {
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
            await updateReceiptData(businessUuid, {
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
            await updateReceiptData(businessUuid, {
                transaction_next_number: value,
            });
        } catch (err) {
            console.error('Error updating transaction number:', err);
            setError('Failed to update transaction number');
        }
    };

    return {
        isLoading,
        error,
        template,
        updateTemplate,
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
    };
}
