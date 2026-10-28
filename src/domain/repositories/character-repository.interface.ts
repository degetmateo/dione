export interface CharacterRecord {
    _id: number;
    name: string;
    url: string;
    gender: string | null;
    age: string | null;
    favourites: number;
    images: Array<{ url: string }>;
    media?: Array<{
        id: number;
        title: { userPreferred: string };
        siteUrl: string;
        favourites: number;
    }>;
    claimed_count: number;
    updated_at: Date;
}

export interface ICharacterRepository {
    findById(id: number): Promise<CharacterRecord | null>;
    findByName(name: string): Promise<CharacterRecord | null>;
    getAll(): Promise<CharacterRecord[]>;
    incrementClaimCount(id: number): Promise<void>;
    save(character: CharacterRecord): Promise<void>;
}

