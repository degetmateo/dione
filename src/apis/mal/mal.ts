import GenericError from "../../errors/genericError";
import membersRepository from "../../repositories/members/members.repository";
import malRequestRefresh from "./requests/mal.request.refresh";
import malRequestToken from "./requests/mal.request.token";
import malRequestUser from "./requests/mal.request.user";
import malRequestUserMe from "./requests/mal.request.user.me";

const request = async (uri: string, options?: any) => {
    try {
        if (!options) options = {};
        if (!options.method) options.method = 'GET';
        if (!options.headers) options.headers = {};
        if (!options.headers['Authorization']) options.headers['Authorization'] = 'Bearer ' + process.env.MAL_CLIENT_TOKEN;   
    
        let req = await fetch(uri, options);
        let res = await req.json();

        if (!req.ok) {
            if (req.status === 401) {
                throw new GenericError('Ha ocurrido un error de autorización.');                
            } else {
                throw new GenericError('Ha ocurrido un error inesperado.');
            };
        };

        return res;
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();
    };
};

const refresh = async (refresh_token: string, discord_id: string) => {
    try {
        const req = await fetch('https://myanimelist.net/v1/oauth2/token', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + process.env.MAL_CLIENT_TOKEN
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: process.env.MAL_CLIENT_ID as string,
                client_secret: process.env.MAL_CLIENT_TOKEN as string
            })
        });

        if (!req.ok) {
            throw new GenericError('Ha ocurrido un error inesperado.');
        };

        const tokens: {
            access_token: string;
            refresh_token: string;
        } = await req.json() as any;

        membersRepository.update.mal.tokens(discord_id, tokens);

        return tokens;
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();  
    };
};

const mal = {
    request,
    refresh,
    token: malRequestToken,
    user: {
        me: malRequestUserMe,
        get: malRequestUser
    }
};

export default mal;