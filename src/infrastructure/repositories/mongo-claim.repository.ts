import mongo from '../../database/mongo';
import { IClaimRepository, ClaimRecord } from '../../domain/repositories/claim-repository.interface';

export class MongoClaimRepository implements IClaimRepository {
    public async find(guildId: string, characterId: number): Promise<ClaimRecord | null> {
        return (await mongo.claims.findOne({
            _id: `${guildId}_${characterId}` as any,
        })) as unknown as ClaimRecord | null;
    }

    public async findByUser(guildId: string, userId: string): Promise<ClaimRecord[]> {
        return (await mongo.claims.find({
            guild_id: guildId,
            user_id: userId,
        }).toArray()) as unknown as ClaimRecord[];
    }

    public async claim(guildId: string, characterId: number, userId: string): Promise<void> {
        await mongo.claims.insertOne({
            _id: `${guildId}_${characterId}` as any,
            guild_id: guildId,
            character_id: characterId,
            user_id: userId,
        });
    }

    public async transfer(guildId: string, characterId: number, newUserId: string): Promise<void> {
        await mongo.claims.updateOne(
            { _id: `${guildId}_${characterId}` as any },
            { $set: { user_id: newUserId } }
        );
    }

    public async deleteByMember(guildId: string, userId: string): Promise<number> {
        const res = await mongo.claims.deleteMany({ guild_id: guildId, user_id: userId });
        return res.deletedCount;
    }
}

