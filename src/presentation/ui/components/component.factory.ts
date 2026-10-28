import { CharacterClaimCardBuilder, CharacterClaimCardData } from './character/character-claim-card.builder';
import { CharacterInfoCardBuilder, CharacterInfoCardData } from './character/character-info-card.builder';
import { AnimeCardBuilder } from './media/anime-card.builder';
import { GachaInventoryCardBuilder, GachaInventoryCardData } from './gacha/gacha-inventory-card.builder';
import { GachaTradeConfirmCardBuilder, GachaTradeConfirmCardData } from './gacha/gacha-trade-confirm-card.builder';
import { GachaTradeAcceptCardBuilder, GachaTradeAcceptCardData } from './gacha/gacha-trade-accept-card.builder';
import { GachaTradeFinishCardBuilder, GachaTradeFinishCardData } from './gacha/gacha-trade-finish-card.builder';
import { GachaTradeErrorBuilder } from './gacha/gacha-trade-error.builder';
import { PatchNotesCardBuilder } from './patch-notes/patch-notes-card.builder';
import { UserActionRowBuilder, UserActionRowData } from './rows/user-action-row.builder';
import { VnActionRowBuilder } from './rows/vn-action-row.builder';
import { Anianime } from '../../../domain/models';

export class ComponentFactory {
    public static createCharacterClaimCard(data: CharacterClaimCardData): CharacterClaimCardBuilder {
        return new CharacterClaimCardBuilder(data);
    }

    public static createCharacterInfoCard(data: CharacterInfoCardData): CharacterInfoCardBuilder {
        return new CharacterInfoCardBuilder(data);
    }

    public static createAnimeCard(anime: Anianime): AnimeCardBuilder {
        return new AnimeCardBuilder(anime);
    }

    public static createGachaInventory(data: GachaInventoryCardData): GachaInventoryCardBuilder {
        return new GachaInventoryCardBuilder(data);
    }

    public static createGachaTradeConfirm(data: GachaTradeConfirmCardData): GachaTradeConfirmCardBuilder {
        return new GachaTradeConfirmCardBuilder(data);
    }

    public static createGachaTradeAccept(data: GachaTradeAcceptCardData): GachaTradeAcceptCardBuilder {
        return new GachaTradeAcceptCardBuilder(data);
    }

    public static createGachaTradeFinish(data: GachaTradeFinishCardData): GachaTradeFinishCardBuilder {
        return new GachaTradeFinishCardBuilder(data);
    }

    public static createGachaTradeError(cname: string, cimage: string, locale?: string): GachaTradeErrorBuilder {
        return new GachaTradeErrorBuilder(cname, cimage, locale);
    }

    public static createPatchNotes(avatarURL: string): PatchNotesCardBuilder {
        return new PatchNotesCardBuilder(avatarURL);
    }

    public static createUserActionRow(data: UserActionRowData): UserActionRowBuilder {
        return new UserActionRowBuilder(data);
    }

    public static createVnActionRow(id: string): VnActionRowBuilder {
        return new VnActionRowBuilder(id);
    }
}
