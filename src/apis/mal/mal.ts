import GenericError from "../../errors/genericError";
import malRequestToken from "./requests/mal.request.token";
import malRequestUserMe from "./requests/mal.request.user.me";

const authorize = async (code: string, state: string) => {
    try {
        const URL = 
            `https://myanimelist.net/v1/oauth2/authorize?`+
            `response_type=code&`+
            `client_id=${process.env.MAL_CLIENT_ID}&`+
            `state=${state}&`+
            `code_challenge=${code}&`+
            `code_challenge_method=plain`;

        const req = await fetch(URL, { method: "GET" });
        const res = await req.json();
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();  
    };
};

const mal = {
    authorize: authorize,
    token: malRequestToken,
    user: {
        me: malRequestUserMe
    }
};

export default mal;