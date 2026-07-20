import GenericError from "../../errors/genericError";
import { codes } from "../../static/codes";
import anilistRandom from "./queries/anilist.random";
import anilistSearchAnimeById from "./queries/anilist.search.anime.id";
import anilistSearchAnimeByName from "./queries/anilist.search.anime.name";
import anilistSearchEntries from "./queries/anilist.search.entries";
import anilistSearchMangaById from "./queries/anilist.search.manga.id";
import anilistSearchMangaByName from "./queries/anilist.search.manga.name";
import anilistSearchScores from "./queries/anilist.search.scores";
import anilistSearchUser from "./queries/anilist.search.user";
import anilistViewer from "./queries/anilist.viewer";

const URL: string = 'https://graphql.anilist.co';

const request = async (query: string) => {
    const request = await fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ query })
    });

    const response: any = await request.json();
    
    if (!request.ok) {
        const error = codes[response.errors[0].status];
        if (error) throw new GenericError(error, response.errors[0].status);
        else throw response.errors[0];
    };

    return response.data;
};

const authorizedRequest = async (query: string, token: string) => {
    const request = await fetch (URL, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify ({ query })
    })

    const response: any = await request.json();
    
    if (!request.ok) {
        const message: any = codes[response.errors[0].status];
        if (message) throw new GenericError(message, response.errors[0].status);
        else throw response.errors[0];
    };

    return response.data;
};

const anilist = {
    request,
    authorizedRequest,
    viewer: anilistViewer,
    search: {
        user: anilistSearchUser,
        scores: anilistSearchScores,
        entries: anilistSearchEntries,
        anime: {
            id: anilistSearchAnimeById,
            name: anilistSearchAnimeByName
        },
        manga: {
            id: anilistSearchMangaById,
            name: anilistSearchMangaByName
        }
    },
    random: anilistRandom
};

export default anilist;