import { describe, it, expect } from 'vitest';
import { PearsonCalculatorService } from '../../src/domain/services/pearson-calculator.service';
import { GachaRulesService } from '../../src/domain/services/gacha-rules.service';

describe('PearsonCalculatorService', () => {
    it('should return 100 for perfectly identical score vectors', () => {
        const userA = [
            { mediaId: 1, score: 80 },
            { mediaId: 2, score: 90 },
            { mediaId: 3, score: 70 },
        ];
        const userB = [
            { mediaId: 1, score: 80 },
            { mediaId: 2, score: 90 },
            { mediaId: 3, score: 70 },
        ];
        const result = PearsonCalculatorService.calculate(userA, userB);
        expect(result).toBe(100);
    });

    it('should return -100 for perfectly inverse score vectors', () => {
        const userA = [
            { mediaId: 1, score: 10 },
            { mediaId: 2, score: 20 },
            { mediaId: 3, score: 30 },
        ];
        const userB = [
            { mediaId: 1, score: 30 },
            { mediaId: 2, score: 20 },
            { mediaId: 3, score: 10 },
        ];
        const result = PearsonCalculatorService.calculate(userA, userB);
        expect(result).toBe(-100);
    });

    it('should return 0 when there are no common items', () => {
        const userA = [{ mediaId: 1, score: 80 }];
        const userB = [{ mediaId: 2, score: 90 }];
        expect(PearsonCalculatorService.calculate(userA, userB)).toBe(0);
    });
});

describe('GachaRulesService', () => {
    it('should calculate pull and claim purchase costs correctly', () => {
        const cost1 = GachaRulesService.calculatePullCost(3);
        expect(cost1.value).toBe(30);

        const cost2 = GachaRulesService.calculateClaimCost(2);
        expect(cost2.value).toBe(200);
    });

    it('should split repeat reward evenly if roller is not owner', () => {
        const reward = GachaRulesService.calculateRepeatReward(10, false);
        expect(reward.ownerRenas.value).toBe(5);
        expect(reward.pullerRenas.value).toBe(5);
    });

    it('should award full repeat reward if roller is owner', () => {
        const reward = GachaRulesService.calculateRepeatReward(10, true);
        expect(reward.ownerRenas.value).toBe(10);
        expect(reward.pullerRenas.value).toBe(0);
    });
});

