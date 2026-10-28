import { ApiClientFactory } from "../infrastructure/external-apis/api-client.factory";
import mongo from "../database/mongo";
import { memoryModule } from "../modules/mem.module";

const updateCharacterHelper = async (_id: number) => {
    try {
        const anilist = ApiClientFactory.getAniListService();
        const data = await anilist.get.character.id(_id);
        const images = [{ url: data.image.large || data.image.medium }];
        const date = new Date();

        mongo.characters.updateOne(
            { _id: _id as any },
            {
                $set: {
                    updated_at: date,
                    name: data.name.full || data.name.userPreferred,
                    favourites: data.favourites,
                    media: data.media.nodes,
                    images: images
                }
            }
        );

        const i = memoryModule.characters.findIndex((char) => char._id == _id);
        if (i >= 0) {
            memoryModule.characters[i].updated_at = date;
            memoryModule.characters[i].name = data.name.full || data.name.userPreferred;
            memoryModule.characters[i].favourites = data.favourites;
            memoryModule.characters[i].media = data.media.nodes;
            memoryModule.characters[i].images = images;
        }
    } catch (error) {
        console.error(error);
    }
};

export default updateCharacterHelper;
