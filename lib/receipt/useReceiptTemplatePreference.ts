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

    const updateTemplate = (newTemplate: ReceiptTemplateType) => {
        setTemplate(newTemplate);
        localStorage.setItem('receiptTemplate', newTemplate);
    };

    const updateIncludeLogo = (value: boolean) => {
        setIncludeLogo(value);
        localStorage.setItem('receiptIncludeLogo', String(value));
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
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { template, updateTemplate, includeLogo, updateIncludeLogo };
}
