import mongo from '../../database/mongo';
import { IUserRepository, UserProfileData, UserRecord } from '../../domain/repositories/user-repository.interface';
import { memberModel } from '../../database/models/member.model';

export class MongoUserRepository implements IUserRepository {
    public async findById(id: string): Promise<UserRecord | null> {
        return (await mongo.users.findOne({ _id: id as any })) as unknown as UserRecord | null;
    }

    public async create(id: string, guildId: string): Promise<UserRecord> {
        const user = memberModel.create(id, guildId) as unknown as UserRecord;
        await mongo.users.insertOne(user as any);
        return user;
    }

    public async findOrCreate(id: string, guildId: string): Promise<UserRecord> {
        let user = await this.findById(id);
        if (!user) {
            user = await this.create(id, guildId);
        }
        return user;
    }

    public async updateProfile(id: string, profile: Partial<UserProfileData>): Promise<void> {
        const setFields: Record<string, any> = {};
        for (const [key, value] of Object.entries(profile)) {
            setFields[`profile.${key}`] = value;
        }
        await mongo.users.updateOne({ _id: id as any }, { $set: setFields });
    }

    public async updateGachaPulls(id: string, pulls: number, lastChannelId?: string | null): Promise<void> {
        const update: Record<string, any> = { 'gacha.pulls': pulls };
        if (lastChannelId !== undefined) {
            update['gacha.last_channel_id'] = lastChannelId;
        }
        await mongo.users.updateOne({ _id: id as any }, { $set: update });
    }

    public async updateGachaClaims(id: string, claims: number): Promise<void> {
        await mongo.users.updateOne({ _id: id as any }, { $set: { 'gacha.claims': claims } });
    }

    public async updateRenas(id: string, delta: number): Promise<void> {
        await mongo.users.updateOne({ _id: id as any }, { $inc: { renas: delta } });
    }

    public async updateMalTokens(
        id: string,
        tokens: { access_token: string; refresh_token: string; expires_in?: number }
    ): Promise<void> {
        const update: Record<string, any> = {
            'mal.auth.access_token': tokens.access_token,
            'mal.auth.refresh_token': tokens.refresh_token,
        };
        if (tokens.expires_in) {
            update['mal.auth.expires_in'] = tokens.expires_in;
        }
        await mongo.users.updateOne({ _id: id as any }, { $set: update });
    }

    public async delete(id: string): Promise<boolean> {
        const res = await mongo.users.deleteOne({ _id: id as any });
        return res.deletedCount > 0;
    }
}

