export function normalizeLocale(locale: string | null | undefined): string {
    if (!locale) return 'en';

    const localeMap: Record<string, string> = {
        'en-US': 'en',
        'id-ID': 'id',
        'en-GB': 'en',
        'es-ES': 'es',
        'es-MX': 'es',
        'fr-FR': 'fr',
        'de-DE': 'de',
        'it-IT': 'it',
        'pt-BR': 'pt',
        'pt-PT': 'pt',
        'zh-CN': 'zh',
        'zh-TW': 'zh',
        'ja-JP': 'ja',
        'ko-KR': 'ko',
        'ru-RU': 'ru',
        'ar-SA': 'ar',
        'hi-IN': 'hi',
        'nl-NL': 'nl',
        'sv-SE': 'sv',
        'no-NO': 'no',
        'da-DK': 'da',
    };

    return localeMap[locale] || locale.split('-')[0] || 'en';
}

export const SUPPORTED_LOCALES = [
    'en',
    'es',
    'fr',
    'de',
    'zh',
    'ja',
    'pt',
    'it',
    'ko',
    'ru',
    'ar',
    'hi',
    'nl',
    'sv',
    'no',
    'da',
    'id',
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
    return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getLocaleWithFallback(locale: string | null | undefined): SupportedLocale {
    const normalized = normalizeLocale(locale);
    return isSupportedLocale(normalized) ? normalized : 'en';
}
