import { Renas } from '../value-objects/renas.vo';
import { BusinessRuleError } from '../../core/errors/business-rule-error';

export interface RepeatRewardResult {
    ownerRenas: Renas;
    pullerRenas: Renas;
}

export class GachaRulesService {
    public static readonly PULL_UNIT_PRICE = 10;
    public static readonly CLAIM_UNIT_PRICE = 100;

    public static calculatePullCost(pullsCount: number): Renas {
        if (pullsCount <= 0) {
            throw new BusinessRuleError('La cantidad de pulls debe ser mayor a cero.', 'INVALID_PULLS_COUNT');
        }
        return new Renas(pullsCount * this.PULL_UNIT_PRICE);
    }

    public static calculateClaimCost(claimsCount: number): Renas {
        if (claimsCount <= 0) {
            throw new BusinessRuleError('La cantidad de claims debe ser mayor a cero.', 'INVALID_CLAIMS_COUNT');
        }
        return new Renas(claimsCount * this.CLAIM_UNIT_PRICE);
    }

    public static calculateRepeatReward(baseReward: number, isOwner: boolean): RepeatRewardResult {
        if (isOwner) {
            return {
                ownerRenas: new Renas(baseReward),
                pullerRenas: new Renas(0),
            };
        }
        const half = Math.floor(baseReward / 2);
        return {
            ownerRenas: new Renas(half),
            pullerRenas: new Renas(half),
        };
    }
}

