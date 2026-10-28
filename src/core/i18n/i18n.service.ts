import { LocaleCode, LocaleHelper, SupportedLocale } from './locale-code';
import { SpanishTranslation } from './translations/es.translation';
import { EnglishTranslation } from './translations/en.translation';
import { TranslationDictionary } from './translation-keys';

export class I18nService {
    private static readonly registries: Record<SupportedLocale, TranslationDictionary> = {
        [SupportedLocale.SPANISH_ES]: SpanishTranslation.dictionary,
        [SupportedLocale.SPANISH_LATAM]: SpanishTranslation.dictionary,
        [SupportedLocale.ENGLISH_US]: EnglishTranslation.dictionary,
        [SupportedLocale.ENGLISH_GB]: EnglishTranslation.dictionary,
    };

    public static t(
        locale: LocaleCode | undefined,
        path: string,
        params: Record<string, string | number> = {}
    ): string {
        const normalized = LocaleHelper.normalize(locale);
        const dict = this.registries[normalized] ?? this.registries[SupportedLocale.SPANISH_ES];

        const keys = path.split('.');
        let current: any = dict;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                current = null;
                break;
            }
        }

        if (typeof current !== 'string') {
            return path; // Fallback to key path if missing
        }

        let result = current;
        for (const [key, val] of Object.entries(params)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
        }

        return result;
    }
}

