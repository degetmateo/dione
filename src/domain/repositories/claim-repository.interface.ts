export interface ClaimRecord {
    _id: string; // `${guild_id}_${character_id}`
    guild_id: string;
    character_id: number;
    user_id: string;
}

export interface IClaimRepository {
    find(guildId: string, characterId: number): Promise<ClaimRecord | null>;
    findByUser(guildId: string, userId: string): Promise<ClaimRecord[]>;
    claim(guildId: string, characterId: number, userId: string): Promise<void>;
    transfer(guildId: string, characterId: number, newUserId: string): Promise<void>;
    deleteByMember(guildId: string, userId: string): Promise<number>;
}

