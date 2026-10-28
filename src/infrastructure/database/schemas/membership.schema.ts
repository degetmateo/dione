import { Schema, model } from 'mongoose';

export interface IMembership {
    _id: string; // `${guild_id}_${user_id}`
    guild_id: string;
    user_id: string;
    show_scores: boolean;
}

export const MembershipSchema = new Schema<IMembership>(
    {
        _id: { type: String, required: true },
        guild_id: { type: String, required: true, index: true },
        user_id: { type: String, required: true, index: true },
        show_scores: { type: Boolean, default: true },
    },
    { versionKey: false }
);

export const MembershipModel = model<IMembership>('Membership', MembershipSchema, 'memberships');

