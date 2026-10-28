import mongo from '../../database/mongo';
import { IGuildRepository, GuildRecord, AffinityPair } from '../../domain/repositories/guild-repository.interface';

export class MongoGuildRepository implements IGuildRepository {
    public async findById(guildId: string): Promise<GuildRecord | null> {
        return (await mongo.guilds.findOne({ _id: guildId as any })) as GuildRecord | null;
    }

    public async findOrCreate(guildId: string): Promise<GuildRecord> {
        let guild = await this.findById(guildId);
        if (!guild) {
            guild = { _id: guildId, affinities: [] };
            await mongo.guilds.insertOne(guild as any);
        }
        return guild;
    }

    public async upsertAffinity(guildId: string, affinity: AffinityPair): Promise<void> {
        const guild = await this.findOrCreate(guildId);
        const affinities = guild.affinities || [];
        const index = affinities.findIndex(e =>
            (e.pair.a.discord_id === affinity.pair.a.discord_id && e.pair.b.discord_id === affinity.pair.b.discord_id) ||
            (e.pair.a.discord_id === affinity.pair.b.discord_id && e.pair.b.discord_id === affinity.pair.a.discord_id)
        );

        if (index >= 0) {
            affinities[index] = affinity;
        } else {
            affinities.push(affinity);
        }

        await mongo.guilds.updateOne(
            { _id: guildId as any },
            { $set: { affinities } },
            { upsert: true }
        );
    }
}

