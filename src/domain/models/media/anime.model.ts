import { ColorResolvable } from "discord.js";
import Helpers from "../../../helpers";
import { AnianimeData } from "./anime.types";

export class AnimeModel {
    constructor(public data: AnianimeData) {}

    public getCoverImageUrl() { return this.data.coverImage.extraLarge || this.data.coverImage.large || this.data.coverImage.medium; }
    public getBannerImageUrl() { return this.data.bannerImage; }
    public getColorAsResolvable() { return this.data.coverImage.color as ColorResolvable; }
    public getColorAsRGBTuple() { return Helpers.hexToRgb(this.data.coverImage.color); }
    public getId() { return this.data.id; }
    public getMalId() { return this.data.idMal; }
    public getSiteUrl() { return this.data.siteUrl; }
    public getFormat() { return this.data.format; }
    public getStatus() { return this.data.status; }
    public getDescription() { return Helpers.clearHTML(this.data.description); }
    public getTitle() { return this.data.title.userPreferred || this.data.title.english || this.data.title.romaji || this.data.title.native; }
    public getTitles() { return this.data.title; }
    public getSynonyms() { return this.data.synonyms; }
    public getGenres() { return this.data.genres || []; }
    public getSource() { return this.data.source; }
    public getFavourites() { return this.data.favourites; }
    public getMeanScore() { return this.data.meanScore; }
    public getSeason() { return this.data.season; }
    public getEpisodes() { return this.data.episodes; }
    public getPopularity() { return this.data.popularity; }

    public getStudios() {
        if (this.data.studios?.edges && this.data.studios.edges.length > 1) {
            return this.data.studios.edges.map(e => e.node.name);
        }
        return [];
    }

    public getNoSpoilerTags() {
        if (!this.data.tags || this.data.tags.length < 1) return [];
        return this.data.tags.filter(t => !t.isMediaSpoiler).map(t => t.name);
    }

    public getStartDate(): string | null {
        const d = this.data.startDate;
        return d && d.day && d.month && d.year ? `${d.day}/${d.month}/${d.year}` : null;
    }
}

