export type VN = {
    id: string;
    aliases: Array<any>;
    average: number;
    description: string;
    devstatus: number;
    image: {
        url: string;
        thumbnail: string;
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
    }>;
};

export const DEVSTATUS: any = {
    0: "FINISHED",
    1: "IN DEVELOPMENT",
    2: "CANCELLED"
};