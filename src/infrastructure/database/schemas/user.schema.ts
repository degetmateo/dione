import { Schema, model } from 'mongoose';

export interface IUser {
    _id: string; // Discord user ID
    created_at: Date;
    renas: number;
    anilist?: {
        id: number | string;
        token: string;
    } | null;
    mal?: {
        id: number;
        name: string;
        joined_at?: Date;
        auth?: {
            token_type?: string;
            expires_in?: number;
            access_token?: string;
            refresh_token?: string;
        };
    } | null;
    vndb?: {
        id: string;
        username: string;
        auth?: {
            token?: string;
            permissions?: string[];
        };
    } | null;
    profile: {
        color: string | null;
        avatar_url: string | null;
        banner_url: string | null;
        preferred_platform: 'anilist' | 'mal' | 'vndb' | null;
    };
    gacha: {
        pulls: number;
        claims: number;
        last_channel_id: string | null;
    };
    claimed_characters_count: number;
}

export const UserSchema = new Schema<IUser>(
    {
        _id: { type: String, required: true },
        created_at: { type: Date, default: () => new Date() },
        renas: { type: Number, default: 0, min: 0 },
        anilist: { type: Schema.Types.Mixed, default: null },
        mal: { type: Schema.Types.Mixed, default: null },
        vndb: { type: Schema.Types.Mixed, default: null },
        profile: {
            color: { type: String, default: null },
            avatar_url: { type: String, default: null },
            banner_url: { type: String, default: null },
            preferred_platform: { type: String, enum: ['anilist', 'mal', 'vndb', null], default: null },
        },
        gacha: {
            pulls: { type: Number, default: 15, min: 0 },
            claims: { type: Number, default: 2, min: 0 },
            last_channel_id: { type: String, default: null },
        },
        claimed_characters_count: { type: Number, default: 0, min: 0 },
    },
    { versionKey: false }
);

export const UserModel = model<IUser>('User', UserSchema, 'users');
