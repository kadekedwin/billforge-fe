import { useLocale } from "@/contexts/locale-context";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import pt from "./locales/pt.json";
import ko from "./locales/ko.json";
import id from "./locales/id.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<string, any> = {
    en,
    es,
    fr,
    de,
    zh,
    ja,
    pt,
    ko,
    id,
};

type TranslationKey = string;

export function useTranslation() {
    const { locale } = useLocale();

    const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
        const keys = key.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = translations[locale] || translations.en;

        for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
                value = value[k];
            } else {
                value = translations.en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === "object" && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return key;
                    }
                }
                break;
            }
        }

        if (typeof value !== "string") {
            return key;
        }

        if (params) {
            return Object.entries(params).reduce(
                (acc, [paramKey, paramValue]) =>
                    acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue)),
                value
            );
        }

        return value;
    };

    return { t, locale };
}
