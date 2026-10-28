import { I18nService } from '../core/i18n/i18n.service';

export default (locale: string, seconds: any): string => {
    return I18nService.t(locale, 'common.cooldownRemaining', { seconds });
};
