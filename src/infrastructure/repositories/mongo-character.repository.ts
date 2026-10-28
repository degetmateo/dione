import mongo from '../../database/mongo';
import { ICharacterRepository, CharacterRecord } from '../../domain/repositories/character-repository.interface';

export class MongoCharacterRepository implements ICharacterRepository {
    public async findById(id: number): Promise<CharacterRecord | null> {
        return (await mongo.characters.findOne({ _id: id as any })) as unknown as CharacterRecord | null;
    }

    public async findByName(name: string): Promise<CharacterRecord | null> {
        return (await mongo.characters.findOne({
            name: { $regex: name, $options: 'i' },
        })) as unknown as CharacterRecord | null;
    }

    public async getAll(): Promise<CharacterRecord[]> {
        return (await mongo.characters.find().toArray()) as unknown as CharacterRecord[];
    }

    public async incrementClaimCount(id: number): Promise<void> {
        await mongo.characters.updateOne(
            { _id: id as any },
            { $inc: { claimed_count: 1 } }
        );
    }

    public async save(character: CharacterRecord): Promise<void> {
        await mongo.characters.updateOne(
            { _id: character._id as any },
            { $set: character },
            { upsert: true }
        );
    }
}

