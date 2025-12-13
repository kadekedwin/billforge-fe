"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/contexts/locale-context";
import { Globe } from "lucide-react";
import { SupportedLocale } from "@/lib/i18n/locale-utils";

import { APP_LANGUAGES } from "@/lib/data/locale-data";

export function LanguageSelector() {
    const { locale, setLocale } = useLocale();

    return (
        <Select value={locale} onValueChange={(value: SupportedLocale) => setLocale(value)}>
            <SelectTrigger className="w-[140px] gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {APP_LANGUAGES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
