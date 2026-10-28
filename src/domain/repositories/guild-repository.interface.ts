export interface AffinityPair {
    pearson: number;
    pair: {
        a: { discord_id: string };
        b: { discord_id: string };
    };
}

export interface GuildRecord {
    _id: string; // Guild ID
    affinities: AffinityPair[];
}

export interface IGuildRepository {
    findById(guildId: string): Promise<GuildRecord | null>;
    findOrCreate(guildId: string): Promise<GuildRecord>;
    upsertAffinity(guildId: string, affinity: AffinityPair): Promise<void>;
}

