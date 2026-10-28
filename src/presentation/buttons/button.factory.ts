import { IButtonHandler } from '../discord/button.interface';
import { ClaimButton } from './character/claim.button';
import { FavButton } from './character/fav.button';
import { RenasButton } from './character/renas.button';
import { CharacterBackButton } from './character/character-back.button';
import { CharacterNextButton } from './character/character-next.button';
import { CharacterFavButton } from './character/character-fav.button';
import { GachaInventoryBackButton } from './gacha/gacha-inventory-back.button';
import { GachaInventoryNextButton } from './gacha/gacha-inventory-next.button';
import { GachaTradeConfirmButton } from './gacha/gacha-trade-confirm.button';
import { GachaTradeAcceptButton } from './gacha/gacha-trade-accept.button';
import { GachaSellConfirmButton } from './gacha/gacha-sell-confirm.button';
import { GachaSellBuyButton } from './gacha/gacha-sell-buy.button';
import { GachaAuctionStartButton } from './gacha/gacha-auction-start.button';
import { GachaAuctionPushButton } from './gacha/gacha-auction-push.button';
import { GachaAuctionAcceptPushButton } from './gacha/gacha-auction-accept-push.button';
import { MediaBackButton } from './media/media-back.button';
import { MediaNextButton } from './media/media-next.button';
import { VnBackButton } from './media/vn-back.button';
import { VnNextButton } from './media/vn-next.button';
import { SetupAnilistButton } from './setup/setup-anilist.button';
import { SetupInstructionsAnilistButton } from './setup/setup-instructions-anilist.button';
import { SetupMalButton } from './setup/setup-mal.button';
import { SetupInstructionsMalButton } from './setup/setup-instructions-mal.button';
import { SetupVndbButton } from './setup/setup-vndb.button';
import { SetupInstructionsVndbButton } from './setup/setup-instructions-vndb.button';
import { SetupProfileButton } from './setup/setup-profile.button';
import { UnsetupButton } from './setup/unsetup.button';
import { UserDefaultButton } from './user/user-default.button';
import { UserAnilistButton } from './user/user-anilist.button';
import { UserMalButton } from './user/user-mal.button';
import { UserVndbButton } from './user/user-vndb.button';

export class ButtonFactory {
    public static createAll(): IButtonHandler[] {
        return [
            new ClaimButton(), new FavButton(), new RenasButton(),
            new CharacterBackButton(), new CharacterNextButton(), new CharacterFavButton(),
            new GachaInventoryBackButton(), new GachaInventoryNextButton(),
            new GachaTradeConfirmButton(), new GachaTradeAcceptButton(),
            new GachaSellConfirmButton(), new GachaSellBuyButton(),
            new GachaAuctionStartButton(), new GachaAuctionPushButton(), new GachaAuctionAcceptPushButton(),
            new MediaBackButton(), new MediaNextButton(), new VnBackButton(), new VnNextButton(),
            new SetupAnilistButton(), new SetupInstructionsAnilistButton(),
            new SetupMalButton(), new SetupInstructionsMalButton(),
            new SetupVndbButton(), new SetupInstructionsVndbButton(),
            new SetupProfileButton(), new UnsetupButton(),
            new UserDefaultButton(), new UserAnilistButton(), new UserMalButton(), new UserVndbButton(),
        ];
    }
}

