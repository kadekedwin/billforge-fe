"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useBusiness } from "@/contexts/business-context";
import { getLocaleWithFallback, SupportedLocale } from "@/lib/i18n/locale-utils";

interface LocaleContextType {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const { selectedBusiness } = useBusiness();
    const [locale, setLocaleState] = useState<SupportedLocale>('en');
    const [manuallySet, setManuallySet] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('preferredLocale');
            if (savedLocale && !selectedBusiness) {
                const validLocale = getLocaleWithFallback(savedLocale);
                if (validLocale !== locale) {
                    // eslint-disable-next-line
                    setLocaleState(validLocale);
                    document.documentElement.lang = validLocale;
                }
            }
        }
    }, [selectedBusiness, locale]);

    useEffect(() => {
        if (selectedBusiness?.language && !manuallySet) {
            const newLocale = getLocaleWithFallback(selectedBusiness.language);
            if (newLocale !== locale) {
                // eslint-disable-next-line
                setLocaleState(newLocale);
                if (typeof document !== 'undefined') {
                    document.documentElement.lang = newLocale;
                }
            }
        } else if (!selectedBusiness && !manuallySet) {
            const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('preferredLocale') : null;
            const newLocale = savedLocale ? getLocaleWithFallback(savedLocale) : 'en';
            if (newLocale !== locale) {
                // eslint-disable-next-line
                setLocaleState(newLocale);
                if (typeof document !== 'undefined') {
                    document.documentElement.lang = newLocale;
                }
            }
        }
    }, [selectedBusiness, manuallySet, locale]);

    const setLocale = (newLocale: SupportedLocale) => {
        setLocaleState(newLocale);
        setManuallySet(true);

        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredLocale', newLocale);
            document.documentElement.lang = newLocale;
        }

        setTimeout(() => setManuallySet(false), 100);
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error("useLocale must be used within a LocaleProvider");
    }
    return context;
}
