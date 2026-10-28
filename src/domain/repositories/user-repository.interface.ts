export interface UserProfileData {
    color: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    preferred_platform: 'anilist' | 'mal' | 'vndb' | null;
}

export interface UserGachaData {
    pulls: number;
    claims: number;
    last_channel_id: string | null;
}

export interface UserRecord {
    _id: string;
    created_at: Date;
    renas: number;
    anilist?: any | null;
    mal?: any | null;
    vndb?: any | null;
    profile: UserProfileData;
    gacha: UserGachaData;
    claimed_characters_count?: number;
}

export interface IUserRepository {
    findById(id: string): Promise<UserRecord | null>;
    create(id: string, guildId: string): Promise<UserRecord>;
    findOrCreate(id: string, guildId: string): Promise<UserRecord>;
    updateProfile(id: string, profile: Partial<UserProfileData>): Promise<void>;
    updateGachaPulls(id: string, pulls: number, lastChannelId?: string | null): Promise<void>;
    updateGachaClaims(id: string, claims: number): Promise<void>;
    updateRenas(id: string, delta: number): Promise<void>;
    updateMalTokens(id: string, tokens: { access_token: string; refresh_token: string; expires_in?: number }): Promise<void>;
    delete(id: string): Promise<boolean>;
}

