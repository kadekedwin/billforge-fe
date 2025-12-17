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

const PRINT_TEMPLATE_ID_MAP: Record<number, PrintTemplateType> = {
    0: 'thermal-classic',
    1: 'thermal-compact',
    2: 'thermal-detailed',
};

const PRINT_TEMPLATE_TYPE_MAP: Record<PrintTemplateType, number> = {
    'thermal-classic': 0,
    'thermal-compact': 1,
    'thermal-detailed': 2,
};

interface UseReceiptTemplatePreferenceProps {
    businessUuid: string | null;
}

export function useReceiptTemplatePreference({ businessUuid }: UseReceiptTemplatePreferenceProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isLoadingRef = useRef(false);

    const [imageTemplate, setImageTemplate] = useState<ImageTemplateType>('classic');
    const [printTemplate, setPrintTemplate] = useState<PrintTemplateType>('thermal-classic');
    const [includeLogo, setIncludeLogo] = useState<boolean>(false);
    const [footerMessage, setFooterMessage] = useState<string>('');
    const [qrcodeValue, setQrcodeValue] = useState<string>('');
    const [transactionPrefix, setTransactionPrefix] = useState<string>('');
    const [transactionNextNumber, setTransactionNextNumber] = useState<number>(1);

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
                    setImageTemplate(IMAGE_TEMPLATE_ID_MAP[data.image_template_id] || 'classic');
                    setPrintTemplate(PRINT_TEMPLATE_ID_MAP[data.print_template_id] || 'thermal-classic');
                    setIncludeLogo(data.include_image);
                    setFooterMessage(data.footer_message || '');
                    setQrcodeValue(data.qrcode_data || '');
                    setTransactionPrefix(data.transaction_prefix || '');
                    setTransactionNextNumber(data.transaction_next_number);
                }
            } catch (error: unknown) {
                // Type guard to check if error has statusCode property
                if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
                    const createResponse = await createReceiptSettings(businessUuid, {
                        image_template_id: 0,
                        print_template_id: 0,
                        include_image: false,
                        footer_message: '',
                        qrcode_data: '',
                        transaction_prefix: 'INV',
                        transaction_next_number: 1,
                    });

                    if (createResponse.success && createResponse.data) {
                        const data = createResponse.data;
                        setImageTemplate(IMAGE_TEMPLATE_ID_MAP[data.image_template_id] || 'classic');
                        setPrintTemplate(PRINT_TEMPLATE_ID_MAP[data.print_template_id] || 'thermal-classic');
                        setIncludeLogo(data.include_image);
                        setFooterMessage(data.footer_message || '');
                        setQrcodeValue(data.qrcode_data || '');
                        setTransactionPrefix(data.transaction_prefix || '');
                        setTransactionNextNumber(data.transaction_next_number);
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

    const updatePrintTemplate = async (newTemplate: PrintTemplateType) => {
        if (!businessUuid) return;

        setPrintTemplate(newTemplate);

        try {
            await updateReceiptSettings(businessUuid, {
                print_template_id: PRINT_TEMPLATE_TYPE_MAP[newTemplate],
            });
        } catch (err) {
            console.error('Error updating print template:', err);
            setError('Failed to update print template');
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

    return {
        isLoading,
        error,
        imageTemplate,
        updateImageTemplate,
        printTemplate,
        updatePrintTemplate,
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
