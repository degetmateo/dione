export * from './embeds/base.embed-builder';
export * from './embeds/embed.factory';
export * from './embeds/feedback/error.embed';
export * from './embeds/feedback/success.embed';
export * from './embeds/feedback/loading.embed';
export * from './embeds/feedback/affinity.embed';
export * from './embeds/media/anime.embed';
export * from './embeds/media/manga.embed';
export * from './embeds/media/vn.embed';
export * from './embeds/media/scores.embed';
export * from './embeds/media/vn-scores.embed';
export * from './embeds/character/ch.embed';
export * from './embeds/character/character.embed';
export * from './embeds/user/user-profile.embed';
export * from './embeds/user/user-anilist.embed';
export * from './embeds/user/user-mal.embed';
export * from './embeds/user/user-vndb.embed';
export * from './embeds/setup/setup-instructions.embed';
export * from './embeds/setup/setup-success.embed';
export * from './embeds/info/help.embed';
export * from './embeds/info/exchange-help.embed';
export * from './embeds/info/exchange-media.embed';

export * from './components/component.factory';
export * from './components/character/character-claim-card.builder';
export * from './components/character/character-info-card.builder';
export * from './components/media/anime-card.builder';
export * from './components/gacha/gacha-inventory-card.builder';
export * from './components/gacha/gacha-trade-confirm-card.builder';
export * from './components/gacha/gacha-trade-accept-card.builder';
export * from './components/gacha/gacha-trade-finish-card.builder';
export * from './components/gacha/gacha-trade-error.builder';
export * from './components/patch-notes/patch-notes-card.builder';
export * from './components/rows/user-action-row.builder';
export * from './components/rows/vn-action-row.builder';

import { CharacterClaimCardBuilder } from './components/character/character-claim-card.builder';
import { CharacterInfoCardBuilder } from './components/character/character-info-card.builder';
import { AnimeCardBuilder } from './components/media/anime-card.builder';
import { GachaInventoryCardBuilder } from './components/gacha/gacha-inventory-card.builder';
import { GachaTradeConfirmCardBuilder } from './components/gacha/gacha-trade-confirm-card.builder';
import { GachaTradeAcceptCardBuilder } from './components/gacha/gacha-trade-accept-card.builder';
import { GachaTradeFinishCardBuilder } from './components/gacha/gacha-trade-finish-card.builder';
import { GachaTradeErrorBuilder } from './components/gacha/gacha-trade-error.builder';
import { PatchNotesCardBuilder } from './components/patch-notes/patch-notes-card.builder';
import { UserActionRowBuilder } from './components/rows/user-action-row.builder';
import { VnActionRowBuilder } from './components/rows/vn-action-row.builder';
import { VnEmbed } from './embeds/media/vn.embed';
import { Anianime } from '../../domain/models';

export class CharacterClaimCardComponent extends CharacterClaimCardBuilder {}
export class CharacterInfoCardComponent extends CharacterInfoCardBuilder {}
export class GachaInventoryComponent extends GachaInventoryCardBuilder {}
export class GachaTradeConfirmCardComponent extends GachaTradeConfirmCardBuilder {}
export class GachaTradeAcceptCardComponent extends GachaTradeAcceptCardBuilder {}
export class GachaTradeFinishCardComponent extends GachaTradeFinishCardBuilder {}
export class GachaTradeErrorComponent extends GachaTradeErrorBuilder {}
export class PathNotesInfoCardComponent extends PatchNotesCardBuilder {}
export class UserRowComponent extends UserActionRowBuilder {}
export class VNRowComponent extends VnActionRowBuilder {}
export class VNEmbed extends VnEmbed {}

export const AnimeComponent = (anime: Anianime) => new AnimeCardBuilder(anime);
