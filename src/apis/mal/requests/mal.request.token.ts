import GenericError from "../../../errors/genericError";

const malRequestToken = async (code: string, verifier: string): Promise<{
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}> => {
    try {
        const req: any = await fetch('https://myanimelist.net/v1/oauth2/token', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.MAL_CLIENT_ID as string,
                client_secret: process.env.MAL_CLIENT_TOKEN as string,
                grant_type: 'authorization_code',
                code: code,
                code_verifier: verifier
            })
        });

        if (!req.ok) {
            throw new GenericError('Ha ocurrido un error inesperado.');
        }; 

        return await req.json();
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();
    };
};

export default malRequestToken;