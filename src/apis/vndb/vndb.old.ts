import GenericError from "../../errors/genericError";
import Helpers from "../../helpers";
import { codes } from "../../static/codes";
import { VN } from "./vndbTypes";

export default class VNDB {
    private static readonly ENDPOINT: string = 'https://api.vndb.org/kana';
    public static readonly URL: string = 'https://vndb.org';

    public static async query (args: string) {
        const request = await fetch (this.ENDPOINT + '/vn', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "results": 5,
                "page": 1,
                "filters": [Helpers.isNumber(args) ? "id" : "search", "=", args],
                "fields": `
                    title, 
                    aliases, 
                    olang, 
                    devstatus,
                    released,
                    languages,
                    platforms,
                    length_votes,
                    length_minutes,
                    description,
                    average,
                    rating,
                    votecount,
                    image.url,
                    image.thumbnail,
                    tags.name,
                    screenshots.url,
                    screenshots.votecount`
            })
        });

        if (!request.ok) throw new GenericError(codes[request.status] || null);
        return await request.json() as {
            more: boolean;
            results: Array<VN>;
        };
    };
};