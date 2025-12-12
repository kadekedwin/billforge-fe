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

const LANGUAGE_OPTIONS = [
    { value: "en", label: "English" },
    { value: "id", label: "Bahasa Indonesia" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "zh", label: "中文" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "pt", label: "Português" },
];

export function LanguageSelector() {
    const { locale, setLocale } = useLocale();

    return (
        <Select value={locale} onValueChange={(value: SupportedLocale) => setLocale(value)}>
            <SelectTrigger className="w-[140px] gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
