export type T_VN = {
    id: string;
    aliases: Array<any>;
    average: number;
    description: string;
    devstatus: number;
    image: {
        url: string;
        thumbnail: string;
        sexual: 0 | 1 | 2;
        violence: 0 | 1 | 2;
    };
    languages: Array<any>;
    length_minutes: number;
    length_votes: number;
    olang: string;
    platforms: Array<any>;
    rating: number;
    released: string;
    title: string;
    votecount: number;
    tags: Array<{
        id: string;
        name: string;
    }>;
    screenshots: Array<{
        url: string;
        votecount: number;
        sexual: 0 | 1 | 2;
        violence: 0 | 1 | 2;
    }>;
};

export const DEVSTATUS: Record<number, string> = {
    0: "FINISHED",
    1: "IN DEVELOPMENT",
    2: "CANCELLED"
};

