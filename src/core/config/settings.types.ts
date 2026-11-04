export type MediaApiProviderMode = 'auto' | 'anilist' | 'mal';

export interface BotSettings {
    maintenance: boolean;
    maintenance_reason: string | null;
    media_api_provider: MediaApiProviderMode;
    renas_per_reclaim: number;
    devs: string[];
    character_claim_cooldown: number;
}

export const DEFAULT_BOT_SETTINGS: BotSettings = {
    maintenance: false,
    maintenance_reason: null,
    media_api_provider: 'auto',
    renas_per_reclaim: 10,
    devs: [],
    character_claim_cooldown: 300,
};
