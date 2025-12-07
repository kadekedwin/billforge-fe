'use client';

import { useState, useEffect } from 'react';
import { ReceiptTemplateType } from '@/lib/receipt';
import { receiptTemplates } from '@/lib/receipt/templates';

export function useReceiptTemplatePreference() {
    const isValidTemplateType = (value: string | null): value is ReceiptTemplateType => {
        return receiptTemplates.some(t => t.type === value);
    };

    const [template, setTemplate] = useState<ReceiptTemplateType>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('receiptTemplate');
            if (isValidTemplateType(saved)) {
                return saved;
            }
        }
        return 'classic';
    });

    const [includeLogo, setIncludeLogo] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('receiptIncludeLogo');
            return saved === 'true';
        }
        return false;
    });

    const [footerMessage, setFooterMessage] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('receiptFooterMessage');
            return saved || '';
        }
        return '';
    });

    const [qrcodeValue, setQrcodeValue] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('receiptQrcodeValue');
            return saved || '';
        }
        return '';
    });

    const updateTemplate = (newTemplate: ReceiptTemplateType) => {
        setTemplate(newTemplate);
        localStorage.setItem('receiptTemplate', newTemplate);
    };

    const updateIncludeLogo = (value: boolean) => {
        setIncludeLogo(value);
        localStorage.setItem('receiptIncludeLogo', String(value));
    };

    const updateFooterMessage = (value: string) => {
        setFooterMessage(value);
        localStorage.setItem('receiptFooterMessage', value);
    };

    const updateQrcodeValue = (value: string) => {
        setQrcodeValue(value);
        localStorage.setItem('receiptQrcodeValue', value);
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'receiptTemplate') {
                const value = e.newValue;
                if (isValidTemplateType(value)) {
                    setTemplate(value);
                }
            } else if (e.key === 'receiptIncludeLogo') {
                setIncludeLogo(e.newValue === 'true');
            } else if (e.key === 'receiptFooterMessage') {
                setFooterMessage(e.newValue || '');
            } else if (e.key === 'receiptQrcodeValue') {
                setQrcodeValue(e.newValue || '');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { template, updateTemplate, includeLogo, updateIncludeLogo, footerMessage, updateFooterMessage, qrcodeValue, updateQrcodeValue };
}
