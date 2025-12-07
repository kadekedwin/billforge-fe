'use client';

import { useState, useEffect } from 'react';
import { ReceiptTemplateType } from '@/lib/receipt';

export function useReceiptTemplatePreference() {
    const [template, setTemplate] = useState<ReceiptTemplateType>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('receiptTemplate');
            if (saved && (saved === 'classic' || saved === 'sans-serif')) {
                return saved;
            }
        }
        return 'classic';
    });

    const updateTemplate = (newTemplate: ReceiptTemplateType) => {
        setTemplate(newTemplate);
        localStorage.setItem('receiptTemplate', newTemplate);
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'receiptTemplate' && e.newValue) {
                if (e.newValue === 'classic' || e.newValue === 'sans-serif') {
                    setTemplate(e.newValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { template, updateTemplate };
}

