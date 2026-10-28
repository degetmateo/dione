import { AniListService } from './anilist/anilist.service';
import { MalService } from './mal/mal.service';
import { VndbService } from './vndb/vndb.service';
import { CrossPlatformScoresService } from './common/cross-platform-scores.service';

export class ApiClientFactory {
    private static anilistInstance?: AniListService;
    private static malInstance?: MalService;
    private static vndbInstance?: VndbService;
    private static crossPlatformScoresInstance?: CrossPlatformScoresService;

    public static getAniListService(): AniListService {
        if (!this.anilistInstance) {
            this.anilistInstance = new AniListService();
        }
        return this.anilistInstance;
    }

    public static getAniListClient(): AniListService {
        return this.getAniListService();
    }

    public static getMalService(): MalService {
        if (!this.malInstance) {
            this.malInstance = new MalService();
        }
        return this.malInstance;
    }

    public static getMalClient(): MalService {
        return this.getMalService();
    }

    public static getVndbService(): VndbService {
        if (!this.vndbInstance) {
            this.vndbInstance = new VndbService();
        }
        return this.vndbInstance;
    }

    public static getVndbClient(): VndbService {
        return this.getVndbService();
    }

    public static getCrossPlatformScoresService(): CrossPlatformScoresService {
        if (!this.crossPlatformScoresInstance) {
            this.crossPlatformScoresInstance = new CrossPlatformScoresService(
                this.getAniListService(),
                this.getMalService()
            );
        }
        return this.crossPlatformScoresInstance;
    }
}

