export * from './media/anime.types';
export * from './media/anime.model';
export * from './media/media-entry.types';
export * from './media/vn.types';
export * from './media/vn.model';
export * from './user/aniuser.model';

import { AnimeModel } from './media/anime.model';
import { AniuserModel } from './user/aniuser.model';
import { VnModel } from './media/vn.model';

export class Anianime extends AnimeModel {}
export class Aniuser extends AniuserModel {}
export class VN extends VnModel {}

