import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MongoUserRepository } from '../../src/infrastructure/repositories/mongo-user.repository';
import { MongoClaimRepository } from '../../src/infrastructure/repositories/mongo-claim.repository';
import { MongoGuildRepository } from '../../src/infrastructure/repositories/mongo-guild.repository';
import mongo from '../../src/database/mongo';

vi.mock('../../src/database/mongo', () => {
    return {
        default: {
            users: {
                findOne: vi.fn(),
                insertOne: vi.fn(),
                updateOne: vi.fn(),
                deleteOne: vi.fn(),
            },
            claims: {
                findOne: vi.fn(),
                find: vi.fn(),
                insertOne: vi.fn(),
                updateOne: vi.fn(),
                deleteMany: vi.fn(),
            },
            guilds: {
                findOne: vi.fn(),
                insertOne: vi.fn(),
                updateOne: vi.fn(),
            },
            characters: {
                findOne: vi.fn(),
                find: vi.fn(),
                updateOne: vi.fn(),
            },
        },
    };
});

describe('MongoUserRepository', () => {
    let repo: MongoUserRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new MongoUserRepository();
    });

    it('should find user by id', async () => {
        (mongo.users.findOne as any).mockResolvedValue({ _id: '123', renas: 100 });
        const user = await repo.findById('123');
        expect(user).toBeDefined();
        expect(user?._id).toBe('123');
    });

    it('should update renas with increment', async () => {
        await repo.updateRenas('123', 50);
        expect(mongo.users.updateOne).toHaveBeenCalledWith(
            { _id: '123' },
            { $inc: { renas: 50 } }
        );
    });
});

describe('MongoClaimRepository', () => {
    let repo: MongoClaimRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new MongoClaimRepository();
    });

    it('should insert new claim correctly', async () => {
        await repo.claim('guild1', 42, 'user1');
        expect(mongo.claims.insertOne).toHaveBeenCalledWith({
            _id: 'guild1_42',
            guild_id: 'guild1',
            character_id: 42,
            user_id: 'user1',
        });
    });

    it('should transfer claim to new user', async () => {
        await repo.transfer('guild1', 42, 'user2');
        expect(mongo.claims.updateOne).toHaveBeenCalledWith(
            { _id: 'guild1_42' },
            { $set: { user_id: 'user2' } }
        );
    });
});

describe('MongoGuildRepository', () => {
    let repo: MongoGuildRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new MongoGuildRepository();
    });

    it('should upsert affinity pair in guild', async () => {
        (mongo.guilds.findOne as any).mockResolvedValue({ _id: 'g1', affinities: [] });
        await repo.upsertAffinity('g1', {
            pearson: 85.5,
            pair: { a: { discord_id: 'u1' }, b: { discord_id: 'u2' } },
        });

        expect(mongo.guilds.updateOne).toHaveBeenCalled();
    });
});

