import { MediaProviderSource } from './anime.types';

export interface MangaData {
    provider?: MediaProviderSource;
    id: number;
    idMal: number;
    scoreScale?: 10 | 100;
    rank?: number | null;
    authors?: string[];
    serializations?: string[];
    title?: {
        romaji?: string;
        english?: string;
        native?: string;
        userPreferred?: string;
    };
    format?: string | null;
    status?: string | null;
    description?: string | null;
    startDate?: {
        year?: number | null;
        month?: number | null;
        day?: number | null;
    };
    chapters?: number | null;
    volumes?: number | null;
    source?: string | null;
    coverImage?: {
        extraLarge?: string;
        large?: string;
        medium?: string;
        color?: string | null;
    };
    bannerImage?: string | null;
    genres?: string[];
    tags?: Array<{ name: string; isMediaSpoiler?: boolean }>;
    meanScore?: number | null;
    averageScore?: number | null;
    popularity?: number | null;
    favourites?: number | null;
    siteUrl?: string | null;
}

