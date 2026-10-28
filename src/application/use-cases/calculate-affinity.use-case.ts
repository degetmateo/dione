import { ApiClientFactory } from '../../infrastructure/external-apis/api-client.factory';
import { UserModel } from '../../infrastructure/database/schemas/user.schema';
import { MongoGuildRepository } from '../../infrastructure/repositories/mongo-guild.repository';
import { PearsonCalculatorService } from '../../domain/services/pearson-calculator.service';
import { ValidationError } from '../../core/errors/validation-error';
import { BusinessRuleError } from '../../core/errors/business-rule-error';
import { I18nService } from '../../core/i18n/i18n.service';

export interface CalculateAffinityInput {
    guildId: string;
    userAId: string;
    userBId: string;
    locale?: string;
}

export interface CalculateAffinityOutput {
    pearson: number;
    userAId: string;
    userBId: string;
}

export class CalculateAffinityUseCase {
    constructor(private readonly guildRepository = new MongoGuildRepository()) {}

    public async execute(input: CalculateAffinityInput): Promise<CalculateAffinityOutput> {
        const loc = input.locale;
        if (input.userAId === input.userBId) {
            throw new ValidationError(I18nService.t(loc, 'affinity.selfAffinityError'));
        }

        const userA = await UserModel.findOne({ _id: input.userAId });
        if (!userA || !userA.anilist?.id) {
            throw new BusinessRuleError(I18nService.t(loc, 'common.targetNotRegistered', { userId: input.userAId }));
        }

        const userB = await UserModel.findOne({ _id: input.userBId });
        if (!userB || !userB.anilist?.id) {
            throw new BusinessRuleError(I18nService.t(loc, 'common.targetNotRegistered', { userId: input.userBId }));
        }

        const anilist = ApiClientFactory.getAniListClient();
        const data = await anilist.search.entries(
            String(userB.anilist.id),
            String(userA.anilist.id)
        );
        const userAEntries = [...data.u2_anime.lists[0].entries, ...data.u2_manga.lists[0].entries];
        const userBEntries = [...data.u1_anime.lists[0].entries, ...data.u1_manga.lists[0].entries];

        const pearson = PearsonCalculatorService.calculate(userAEntries, userBEntries);

        await this.guildRepository.upsertAffinity(input.guildId, {
            pearson,
            pair: {
                a: { discord_id: input.userAId },
                b: { discord_id: input.userBId },
            },
        });

        return { pearson, userAId: input.userAId, userBId: input.userBId };
    }
}
