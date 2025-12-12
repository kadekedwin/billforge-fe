import { ReceiptData } from './types';

interface PrinterConfig {
    printerType: string;
    printerPath: string;
    characterSet: string;
    removeSpecialCharacters: boolean;
    lineCharacter: string;
    timeout: number;
}

export async function printThermalReceipt(receiptData: ReceiptData): Promise<{ success: boolean; message: string }> {
    try {
        let printerConfig: PrinterConfig | undefined;

        if (typeof window !== 'undefined') {
            const savedConfig = localStorage.getItem('printerConfig');
            if (savedConfig) {
                try {
                    printerConfig = JSON.parse(savedConfig);
                } catch (error) {
                    console.error('Failed to parse printer config:', error);
                }
            }
        }

        const response = await fetch('/api/print-thermal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                receiptData,
                printerConfig,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to print receipt',
        };
    }
}
