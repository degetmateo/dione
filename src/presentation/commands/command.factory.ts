import { ISlashCommand } from '../discord/command.interface';
import { HelpCommand } from './general/help.command';
import { PatchNotesCommand } from './general/patch-notes.command';
import { ShowScoresCommand } from './general/show-scores.command';
import { AffinityCommand } from './general/affinity.command';
import { RandomCommand } from './general/random.command';
import { AdminUnsetupCommand } from './admin/admin-unsetup.command';
import { EvalCommand } from './dev/eval.command';
import { UnsetupCommand } from './general/unsetup.command';
import { SetupCommand } from './general/setup.command';
import { ChCommand } from './general/ch.command';
import { CharacterCommand } from './general/character.command';
import { GachaCommand } from './general/gacha.command';
import { AnimeCommand } from './general/anime.command';
import { MangaCommand } from './general/manga.command';
import { VnCommand } from './general/vn.command';
import { UserCommand } from './general/user.command';

export class CommandFactory {
    public static createAll(): ISlashCommand[] {
        return [
            new HelpCommand(),
            new PatchNotesCommand(),
            new ShowScoresCommand(),
            new AffinityCommand(),
            new RandomCommand(),
            new AdminUnsetupCommand(),
            new EvalCommand(),
            new UnsetupCommand(),
            new SetupCommand(),
            new ChCommand(),
            new CharacterCommand(),
            new GachaCommand(),
            new AnimeCommand(),
            new MangaCommand(),
            new VnCommand(),
            new UserCommand(),
        ];
    }
}

