import { ColorResolvable } from 'discord.js';
import Helpers from '../../../helpers';
import { AnianimeData, MediaProviderSource } from './anime.types';

export class AnimeModel {
    public constructor(public data: AnianimeData) {}

    public getProvider(): MediaProviderSource { return this.data.provider ?? 'ANILIST'; }
    public getCoverImageUrl() { return this.data.coverImage?.extraLarge || this.data.coverImage?.large || this.data.coverImage?.medium || null; }
    public getBannerImageUrl() { return this.data.bannerImage || null; }
    public getColorAsResolvable() { return (this.data.coverImage?.color || '#2E51A2') as ColorResolvable; }
    public getColorAsRGBTuple() { return Helpers.hexToRgb(this.data.coverImage?.color || '#2E51A2'); }
    public getId() { return this.data.id; }
    public getMalId() { return this.data.idMal; }
    public getDisplayId() { return this.getProvider() === 'MAL' ? this.data.idMal : this.data.id; }
    public getSiteUrl() { return this.data.siteUrl || null; }
    public getFormat() { return this.data.format; }
    public getStatus() { return this.data.status; }
    public getDescription() { return this.data.description ? Helpers.clearHTML(this.data.description) : ''; }
    public getTitle() { return this.data.title?.userPreferred || this.data.title?.english || this.data.title?.romaji || this.data.title?.native || 'Anime'; }
    public getTitles() { return this.data.title; }
    public getSynonyms() { return this.data.synonyms || []; }
    public getGenres() { return this.data.genres || []; }
    public getSource() { return this.data.source; }
    public getFavourites() { return this.data.favourites; }
    public getMeanScore() { return this.data.meanScore; }
    public getRank() { return this.data.rank ?? null; }
    public getSeason() { return this.data.season; }
    public getEpisodes() { return this.data.episodes; }
    public getPopularity() { return this.data.popularity; }

    public getFormattedScore(): string | null {
        const score = this.data.meanScore ?? this.data.averageScore;
        if (!score) return null;
        return (this.data.scoreScale ?? 100) === 10 ? `${score}/10` : `${score}/100`;
    }

    public getStudios(): string[] {
        if (this.data.studioNames?.length) return this.data.studioNames;
        if (this.data.studios?.edges && this.data.studios.edges.length >= 1) {
            return this.data.studios.edges.map(e => e.node.name);
        }
        return [];
    }

    public getNoSpoilerTags(): string[] {
        if (!this.data.tags || this.data.tags.length < 1) return [];
        return this.data.tags.filter(t => !t.isMediaSpoiler).map(t => t.name);
    }

    public getStartDate(): string | null {
        const d = this.data.startDate;
        return d && d.year ? `${d.day ?? 1}/${d.month ?? 1}/${d.year}` : null;
    }
}
