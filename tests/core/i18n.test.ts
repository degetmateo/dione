import { describe, it, expect } from 'vitest';
import { I18nService } from '../../src/core/i18n/i18n.service';

describe('I18nService', () => {
    it('should return Spanish text by default', () => {
        const text = I18nService.t(undefined, 'common.unexpectedError');
        expect(text).toContain('error inesperado');
    });

    it('should return English text when en-US locale is requested', () => {
        const text = I18nService.t('en-US', 'common.unexpectedError');
        expect(text).toContain('unexpected error');
    });

    it('should interpolate parameters correctly in translations', () => {
        const text = I18nService.t('es-ES', 'common.cooldownRemaining', { seconds: 5 });
        expect(text).toBe('Podrás volver a utilizar este comando en 5 segundos.');

        const textEn = I18nService.t('en-US', 'common.cooldownRemaining', { seconds: 5 });
        expect(textEn).toBe('You can use this command again in 5 seconds.');
    });

    it('should fallback to path key if translation key does not exist', () => {
        const text = I18nService.t('es-ES', 'nonexistent.key');
        expect(text).toBe('nonexistent.key');
    });
});

