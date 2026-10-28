import { Schema, model } from 'mongoose';

export interface IFavourite {
    _id: string; // `${guild_id}_${character_id}_${user_id}`
    guild_id: string;
    character_id: number;
    user_id: string;
}

export const FavouriteSchema = new Schema<IFavourite>(
    {
        _id: { type: String, required: true },
        guild_id: { type: String, required: true, index: true },
        character_id: { type: Number, required: true, index: true },
        user_id: { type: String, required: true, index: true },
    },
    { versionKey: false }
);

export const FavouriteModel = model<IFavourite>('Favourite', FavouriteSchema, 'favourites');

