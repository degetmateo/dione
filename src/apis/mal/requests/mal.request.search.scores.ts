import { ObjectId } from "mongodb";
import GenericError from "../../../errors/genericError";

const malRequestSearchScores = async (media: {
    id: number;
    type: 'ANIME' | 'MANGA';
}, malusers: Array<{
    _id: ObjectId,
    discord_id: string;
    mal: {
        id: number;
        name: string;
        auth: {
            access_token: string;
            refresh_token: string;
        }
    }
}>) => {
    try {
        const uri = media.type === 'ANIME' ?
            `https://api.myanimelist.net/v2/anime/${media.id}?fields=my_list_status` :
            `https://api.myanimelist.net/v2/manga/${media.id}?fields=my_list_status`;

        const scores = [];

        for (const maluser of malusers) {
            const req = await fetch(uri, {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + maluser.mal.auth.access_token
                }
            });
            
            if (!req.ok) continue;

            const res: any = await req.json();

            if (!res.my_list_status) continue;
            
            res.user = {
                id: maluser.mal.id,
                name: maluser.mal.name
            };
            
            scores.push(res);
        };

        return scores;
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();
    };
};

export default malRequestSearchScores;