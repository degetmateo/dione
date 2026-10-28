import { Schema, model } from 'mongoose';

export interface ICharacter {
    _id: number; // AniList Character ID
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

export const CharacterSchema = new Schema<ICharacter>(
    {
        _id: { type: Number, required: true },
        name: { type: String, required: true },
        url: { type: String, default: '' },
        gender: { type: String, default: null },
        age: { type: String, default: null },
        favourites: { type: Number, default: 0 },
        images: [{ url: { type: String, required: true } }],
        media: { type: [Schema.Types.Mixed], default: [] },
        claimed_count: { type: Number, default: 0 },
        updated_at: { type: Date, default: () => new Date() },
    },
    { versionKey: false }
);

export const CharacterModel = model<ICharacter>('Character', CharacterSchema, 'characters');

