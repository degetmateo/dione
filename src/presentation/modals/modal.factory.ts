import { IModalHandler } from '../discord/modal.interface';
import { GachaAuctionPushModal } from './gacha/gacha-auction-push.modal';
import { SetupInstructionsAnilistModal } from './setup/setup-instructions-anilist.modal';
import { SetupInstructionsMalModal } from './setup/setup-instructions-mal.modal';
import { SetupInstructionsVndbModal } from './setup/setup-instructions-vndb.modal';
import { SetupProfileModal } from './setup/setup-profile.modal';

export class ModalFactory {
    public static createAll(): IModalHandler[] {
        return [
            new GachaAuctionPushModal(),
            new SetupInstructionsAnilistModal(),
            new SetupInstructionsMalModal(),
            new SetupInstructionsVndbModal(),
            new SetupProfileModal(),
        ];
    }
}

