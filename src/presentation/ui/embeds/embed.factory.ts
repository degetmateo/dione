import { ErrorEmbed } from './feedback/error.embed';
import { SuccessEmbed } from './feedback/success.embed';
import { LoadingEmbed } from './feedback/loading.embed';
import { AffinityEmbed, AffinityEmbedData } from './feedback/affinity.embed';
import { AnimeEmbed } from './media/anime.embed';
import { MangaEmbed } from './media/manga.embed';
import { VnEmbed } from './media/vn.embed';
import { ScoresEmbed, ScoreEntry } from './media/scores.embed';
import { VnScoresEmbed, VnScoreEntry } from './media/vn-scores.embed';
import { CharacterEmbed, CharacterEmbedData } from './character/character.embed';
import { ChEmbed, ChEmbedData } from './character/ch.embed';
import { UserProfileEmbed, UserProfileEmbedData } from './user/user-profile.embed';
import { UserAnilistEmbed } from './user/user-anilist.embed';
import { UserMalEmbed } from './user/user-mal.embed';
import { UserVndbEmbed } from './user/user-vndb.embed';
import { HelpEmbed } from './info/help.embed';
import { SetupInstructionsEmbed } from './setup/setup-instructions.embed';
import { SetupSuccessEmbed } from './setup/setup-success.embed';
import { Anianime, Aniuser, T_VN } from '../../../domain/models';

export class EmbedFactory {
    public static createError(message: string): ErrorEmbed {
        return new ErrorEmbed(message);
    }

    public static createSuccess(message: string): SuccessEmbed {
        return new SuccessEmbed(message);
    }

    public static createLoading(message?: string, locale?: string): LoadingEmbed {
        return new LoadingEmbed(message, locale);
    }

    public static createAffinity(data: AffinityEmbedData): AffinityEmbed {
        return new AffinityEmbed(data);
    }

    public static createAnime(anime: Anianime): AnimeEmbed {
        return new AnimeEmbed(anime);
    }

    public static createManga(data: any): MangaEmbed {
        return new MangaEmbed(data);
    }

    public static createVn(vn: T_VN): VnEmbed {
        return new VnEmbed(vn);
    }

    public static createScores(scores: ScoreEntry[], locale?: string): ScoresEmbed {
        return new ScoresEmbed(scores, locale);
    }

    public static createVnScores(scores: VnScoreEntry[], locale?: string): VnScoresEmbed {
        return new VnScoresEmbed(scores, locale);
    }

    public static createCharacter(data: CharacterEmbedData): CharacterEmbed {
        return new CharacterEmbed(data);
    }

    public static createCh(data: ChEmbedData): ChEmbed {
        return new ChEmbed(data);
    }

    public static createUserProfile(data: UserProfileEmbedData): UserProfileEmbed {
        return new UserProfileEmbed(data);
    }

    public static createUserAnilist(aniuser: Aniuser): UserAnilistEmbed {
        return new UserAnilistEmbed(aniuser);
    }

    public static createUserMal(maluser: any): UserMalEmbed {
        return new UserMalEmbed(maluser);
    }

    public static createUserVndb(vndbuser: any): UserVndbEmbed {
        return new UserVndbEmbed(vndbuser);
    }

    public static createHelp(): HelpEmbed {
        return new HelpEmbed();
    }

    public static createSetupInstructions(service?: string, locale?: string): SetupInstructionsEmbed {
        return new SetupInstructionsEmbed(service, locale);
    }

    public static createSetupSuccess(name: string, url: string, locale?: string): SetupSuccessEmbed {
        return new SetupSuccessEmbed(name, url, locale);
    }
}
