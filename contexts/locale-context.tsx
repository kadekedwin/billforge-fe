"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { getLocaleWithFallback, SupportedLocale } from "@/lib/i18n/locale-utils";

interface LocaleContextType {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<SupportedLocale>('en');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('preferredLocale');
            const newLocale = savedLocale ? getLocaleWithFallback(savedLocale) : 'en';

            if (newLocale !== locale) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLocaleState(newLocale);
                if (typeof document !== 'undefined') {
                    document.documentElement.lang = newLocale;
                }
            }
        }
    }, [locale]);

    const setLocale = (newLocale: SupportedLocale) => {
        setLocaleState(newLocale);

        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredLocale', newLocale);
            document.documentElement.lang = newLocale;
        }
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
