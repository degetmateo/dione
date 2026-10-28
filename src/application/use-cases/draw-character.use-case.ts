import { MongoUserRepository } from '../../infrastructure/repositories/mongo-user.repository';
import { MongoClaimRepository } from '../../infrastructure/repositories/mongo-claim.repository';
import { memoryModule } from '../../modules/mem.module';
import { BusinessRuleError } from '../../core/errors/business-rule-error';
import Helpers from '../../helpers';
import updateCharacterHelper from '../../helpers/update-character.helper';
import { FavouriteModel } from '../../infrastructure/database/schemas/favourite.schema';

export interface DrawCharacterResult {
    character: any;
    ownerId?: string | null;
    favourites: any[];
}

export class DrawCharacterUseCase {
    constructor(
        private readonly userRepo = new MongoUserRepository(),
        private readonly claimRepo = new MongoClaimRepository()
    ) {}

    public async execute(userId: string, guildId: string, channelId: string): Promise<DrawCharacterResult> {
        const user = await this.userRepo.findOrCreate(userId, guildId);

        if (user.gacha.pulls <= 0) {
            throw new BusinessRuleError('OUT_OF_PULLS');
        }

        await this.userRepo.updateGachaPulls(userId, user.gacha.pulls - 1, channelId);

        const character = Helpers.getRandomElement(memoryModule.characters);
        if (!character) {
            throw new BusinessRuleError('No hay personajes disponibles en el catálogo.');
        }

        if (!character.updated_at || Helpers.hasPassedMoreThanAMonth(character.updated_at, new Date())) {
            updateCharacterHelper(character._id);
        }

        const claim = await this.claimRepo.find(guildId, character._id);
        const ownerId = claim ? claim.user_id : null;

        const favourites = await FavouriteModel.find({
            guild_id: guildId,
            character_id: character._id,
        }).lean();

        return { character, ownerId, favourites };
    }
}

