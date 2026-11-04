import { describe, it, expect } from 'vitest';
import { ApiClientFactory } from '../../src/infrastructure/external-apis/api-client.factory';

describe('ApiClientFactory', () => {
    it('should return singleton instances of external API services', () => {
        const anilist1 = ApiClientFactory.getAniListService();
        const anilist2 = ApiClientFactory.getAniListService();
        expect(anilist1).toBe(anilist2);

        const mal1 = ApiClientFactory.getMalService();
        const mal2 = ApiClientFactory.getMalService();
        expect(mal1).toBe(mal2);

        const vndb1 = ApiClientFactory.getVndbService();
        const vndb2 = ApiClientFactory.getVndbService();
        expect(vndb1).toBe(vndb2);

        const scores1 = ApiClientFactory.getCrossPlatformScoresService();
        const scores2 = ApiClientFactory.getCrossPlatformScoresService();
        expect(scores1).toBe(scores2);

        const resilient1 = ApiClientFactory.getResilientMediaService();
        const resilient2 = ApiClientFactory.getResilientMediaService();
        expect(resilient1).toBe(resilient2);
    });
});

