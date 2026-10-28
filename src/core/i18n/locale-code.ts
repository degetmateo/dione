export enum SupportedLocale {
    SPANISH_ES = 'es-ES',
    SPANISH_LATAM = 'es-419',
    ENGLISH_US = 'en-US',
    ENGLISH_GB = 'en-GB',
}

export type LocaleCode = 'es-ES' | 'es-419' | 'en-US' | 'en-GB' | string;

export class LocaleHelper {
    public static readonly DEFAULT_LOCALE = SupportedLocale.SPANISH_ES;

    public static normalize(locale?: string): SupportedLocale {
        if (!locale) return this.DEFAULT_LOCALE;
        if (locale.startsWith('es')) {
            return locale === SupportedLocale.SPANISH_LATAM
                ? SupportedLocale.SPANISH_LATAM
                : SupportedLocale.SPANISH_ES;
        }
        if (locale.startsWith('en')) {
            return locale === SupportedLocale.ENGLISH_GB
                ? SupportedLocale.ENGLISH_GB
                : SupportedLocale.ENGLISH_US;
        }
        return this.DEFAULT_LOCALE;
    }
}

