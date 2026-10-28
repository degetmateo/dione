export type AnianimeData = {
    id: number;
    idMal: number;
    title: {
        romaji: string;
        english: string;
        native: string;
        userPreferred: string;
    };
    format: string;
    status: string;
    description: string;
    startDate: {
        year: number;
        month: number;
        day: number;
    };
    endDate: {
        year: number;
        month: number;
        day: number;
    };
    season: string;
    episodes: number;
    duration: number;
    source: string;
    trailer: {
        id: string;
        site: string;
        thumbnail: string;
    };
    updatedAt: string;
    coverImage: {
        extraLarge: string;
        large: string;
        medium: string;
        color: string;
    };
    tags: Array<{
        name: string;
        isMediaSpoiler: boolean;
    }>;
    bannerImage: string;
    genres: Array<any>;
    synonyms: Array<any>;
    averageScore: number;
    meanScore: number;
    popularity: number;
    favourites: number;
    siteUrl: string;
    studios: {
        edges: Array<{
            node: {
                id: number;
                name: string;
            };
        }>;
    };
};

