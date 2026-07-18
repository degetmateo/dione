import GenericError from "../errors/genericError";
import { codes } from "../static/codes";

export default class Anilist {
    private static readonly URL: string = 'https://graphql.anilist.co';

    public static async query (query: string) {
        const request = await fetch(this.URL, {
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
            if (error) throw new GenericError(error);
            else throw response.errors[0];
        };

        return response.data;
    };

    public static async authorizedQuery (query: string, token: string) {
        const request = await fetch (this.URL, {
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
};