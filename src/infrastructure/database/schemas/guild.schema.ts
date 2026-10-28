import { Schema, model } from 'mongoose';

export interface IGuild {
    _id: string; // Discord Guild ID
    affinities: Array<{
        pearson: number;
        pair: {
            a: { discord_id: string };
            b: { discord_id: string };
        };
    }>;
}

export const GuildSchema = new Schema<IGuild>(
    {
        _id: { type: String, required: true },
        affinities: { type: [Schema.Types.Mixed] as any, default: [] },
    },
    { versionKey: false }
);

export const GuildModel = model<IGuild>('Guild', GuildSchema, 'guilds');

