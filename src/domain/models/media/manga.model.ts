import { ColorResolvable } from 'discord.js';
import Helpers from '../../../helpers';
import { MediaProviderSource } from './anime.types';
import { MangaData } from './manga.types';

export class MangaModel {
    public constructor(public readonly data: MangaData) {}

    public getProvider(): MediaProviderSource { return this.data.provider ?? 'ANILIST'; }
    public getId(): number { return this.data.id; }
    public getMalId(): number { return this.data.idMal; }
    public getDisplayId(): number { return this.getProvider() === 'MAL' ? this.data.idMal : this.data.id; }
    public getSiteUrl(): string | null { return this.data.siteUrl || null; }
    public getFormat(): string | null { return this.data.format || null; }
    public getStatus(): string | null { return this.data.status || null; }
    public getChapters(): number | null { return this.data.chapters ?? null; }
    public getVolumes(): number | null { return this.data.volumes ?? null; }
    public getSource(): string | null { return this.data.source || null; }
    public getAuthors(): string[] { return this.data.authors || []; }
    public getPopularity(): number | null { return this.data.popularity ?? null; }
    public getFavourites(): number | null { return this.data.favourites ?? null; }
    public getRank(): number | null { return this.data.rank ?? null; }
    public getBannerImageUrl(): string | null { return this.data.bannerImage || null; }

    public getCoverImageUrl(): string | null {
        return this.data.coverImage?.extraLarge || this.data.coverImage?.large || this.data.coverImage?.medium || null;
    }

    public getColorAsResolvable(): ColorResolvable | null {
        const fallback = this.getProvider() === 'MAL' ? '#2E51A2' : null;
        return ((this.data.coverImage?.color || fallback) as ColorResolvable) ?? null;
    }

    public getTitle(): string {
        const t = this.data.title;
        return t?.userPreferred || t?.english || t?.romaji || t?.native || 'Manga';
    }

    public getFooterTitles(): string[] {
        return Helpers.deleteRepeatedElements([
            this.data.title?.romaji,
            this.data.title?.english,
            this.data.title?.native,
        ].filter(Boolean) as string[]);
    }

    public getDescription(): string | null {
        return this.data.description ? Helpers.clearHTML(this.data.description) : null;
    }

    public getFormattedScore(): string | null {
        const score = this.data.meanScore ?? this.data.averageScore;
        if (!score) return null;
        return (this.data.scoreScale ?? 100) === 10 ? `${score}/10` : `${score}/100`;
    }

    public getStartDate(): string | null {
        const d = this.data.startDate;
        return d?.year ? `${d.day ?? 1}/${d.month ?? 1}/${d.year}` : null;
    }

    public getGenres(): string[] { return this.data.genres || []; }

    public getNoSpoilerTags(): string[] {
        return (this.data.tags || []).filter(t => !t.isMediaSpoiler).map(t => t.name);
    }
}

