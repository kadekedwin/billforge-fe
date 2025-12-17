import { useState } from 'react';
import { ReceiptData, ReceiptTemplateType } from '@/lib/receipt-generator/types';

export interface PDFGeneratorOptions {
    width?: string;
    height?: string;
    printBackground?: boolean;
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    template?: ReceiptTemplateType;
}

export interface ImageGeneratorOptions {
    type?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    fullPage?: boolean;
    omitBackground?: boolean;
    width?: number;
    height?: number;
    template?: ReceiptTemplateType;
}

export const useReceiptGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePDF = async (
        receiptData: ReceiptData,
        options: PDFGeneratorOptions = {},
        template: ReceiptTemplateType = 'classic',
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/receipt/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiptData, options: { ...options, template } }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${receiptData.receiptNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return blob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generateImage = async (
        receiptData: ReceiptData,
        options: ImageGeneratorOptions = {},
        template: ReceiptTemplateType = 'classic'
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/receipt/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiptData, options: { ...options, template } }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate image');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const extension = options.type || 'png';
            a.href = url;
            a.download = `receipt-${receiptData.receiptNumber}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return blob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const previewPDF = async (
        receiptData: ReceiptData,
        options: PDFGeneratorOptions = {},
        template: ReceiptTemplateType = 'classic'
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/receipt/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiptData, options: { ...options, template } }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');

            return blob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const previewImage = async (
        receiptData: ReceiptData,
        options: ImageGeneratorOptions = {},
        template: ReceiptTemplateType = 'classic'
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/receipt/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiptData, options: { ...options, template } }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');

            return blob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        generatePDF,
        generateImage,
        previewPDF,
        previewImage,
        loading,
        error
    };
};