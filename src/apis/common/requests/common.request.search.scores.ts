import { ObjectId } from "mongodb";
import GenericError from "../../../errors/genericError";
import anilist from "../../anilist/anilist";
import mal from "../../mal/mal";

type Score = {
    user: {
        type: 'aniuser' | 'maluser';
        id: number | string;
        name: string;
    },
    progress: number;
    repeat: number;
    score: number;
    status: "COMPLETED" | "DROPPED" | "CURRENT" | "PAUSED" | "REPEATING" | "PLANNING";
};

const commonRequestsSearchScores = async (
    media: {
        type: 'ANIME' | 'MANGA';
        id: number | string;
        idMal: number;
    }, 
    members: Array<{
        _id: ObjectId;
        discord_id: string;
        preferred_platform: 'anilist' | 'mal';
        anilist: {
            id: string;
            token: string;
        };
        mal: {
            id: number;
            name: string;
            auth: {
                access_token: string;
            }
        };
    }>
) => {
    try {
        const scores: Score[] = [];

        const aniusers = members.filter(member => member.preferred_platform === 'anilist');
        const aniusersScores = await anilist.search.scores(media.id, aniusers.map(m => m.anilist.id));

        const malusers: any = members.filter(member => member.preferred_platform === 'mal');
        const malusersScores = await mal.search.scores({
            id: media.idMal,
            type: media.type
        }, malusers);

        for (const aniscore of aniusersScores) {
            scores.push({
                user: {
                    type: 'aniuser',
                    id: aniscore.user.id,
                    name: aniscore.user.name
                },
                status: aniscore.status,
                score: aniscore.score,
                progress: aniscore.progress,
                repeat: aniscore.repeat
            });
        };

        for (const malscore of malusersScores) {
            scores.push({
                user: {
                    type: 'maluser',
                    id: malscore.user.id,
                    name: malscore.user.name
                },
                status: malscore.my_list_status.status.toUpperCase(),
                score: malscore.my_list_status.score * 10,
                progress: malscore.my_list_status.num_episodes_watched,
                repeat: 0
            });
        };

        return scores;
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();  
    };
};

export default commonRequestsSearchScores;