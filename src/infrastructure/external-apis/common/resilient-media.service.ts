import { AniListService } from '../anilist/anilist.service';
import { MalService } from '../mal/mal.service';
import { Anianime, MangaModel, MediaProviderSource } from '../../../domain/models';
import { BotSettingsService } from '../../../core/config/bot-settings.service';
import { ExternalApiError } from '../../../core/errors';

export interface MediaSearchResult<T> {
    data: T;
    provider: MediaProviderSource;
    fallbackUsed: boolean;
}

export interface MediaFailoverStats {
    failoverCount: number;
    lastFailoverAt: string | null;
    lastFailoverError: string | null;
    lastProviderUsed: MediaProviderSource | null;
}

export class ResilientMediaService {
    private stats: MediaFailoverStats = {
        failoverCount: 0,
        lastFailoverAt: null,
        lastFailoverError: null,
        lastProviderUsed: null,
    };

    public constructor(
        private readonly anilist: AniListService,
        private readonly mal: MalService,
        private readonly settings: BotSettingsService = BotSettingsService.getInstance()
    ) {}

    public getStats(): MediaFailoverStats {
        return { ...this.stats };
    }

    public searchAnimeById(id: number | string): Promise<MediaSearchResult<Anianime>> {
        return this.execute(
            () => this.anilist.media.searchAnimeById(id),
            () => this.mal.media.searchAnimeById(id)
        );
    }

    public searchAnimeByName(name: string): Promise<MediaSearchResult<Anianime[]>> {
        return this.execute(
            () => this.anilist.media.searchAnimeByName(name),
            () => this.mal.media.searchAnimeByName(name)
        );
    }

    public searchMangaById(id: number | string): Promise<MediaSearchResult<MangaModel>> {
        return this.execute(
            async () => new MangaModel(await this.anilist.media.searchMangaById(id)),
            () => this.mal.media.searchMangaById(id)
        );
    }

    public searchMangaByName(name: string): Promise<MediaSearchResult<MangaModel[]>> {
        return this.execute(
            async () => {
                const res = await this.anilist.media.searchMangaByName(name);
                return (res?.media || []).map(m => new MangaModel(m));
            },
            () => this.mal.media.searchMangaByName(name)
        );
    }

    private async execute<T>(primary: () => Promise<T>, secondary: () => Promise<T>): Promise<MediaSearchResult<T>> {
        const mode = this.settings.get().media_api_provider;
        if (mode === 'mal') {
            const data = await secondary();
            this.stats.lastProviderUsed = 'MAL';
            return { data, provider: 'MAL', fallbackUsed: false };
        }
        try {
            const data = await primary();
            this.stats.lastProviderUsed = 'ANILIST';
            return { data, provider: 'ANILIST', fallbackUsed: false };
        } catch (error: any) {
            if (mode !== 'auto' || !this.shouldFailover(error)) throw error;
            this.stats.failoverCount += 1;
            this.stats.lastFailoverAt = new Date().toISOString();
            this.stats.lastFailoverError = error?.message || 'AniList unavailable';
            const data = await secondary();
            this.stats.lastProviderUsed = 'MAL';
            return { data, provider: 'MAL', fallbackUsed: true };
        }
    }

    private shouldFailover(error: unknown): boolean {
        if (error instanceof ExternalApiError && (error.statusCode === 400 || error.statusCode === 404)) {
            return false;
        }
        return true;
    }
}
