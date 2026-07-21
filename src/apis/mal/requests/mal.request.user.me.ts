import GenericError from "../../../errors/genericError";

const malRequestUserMe: any = async (token: string): Promise<{
    id: number;
    name: string;
    joined_at: string;
    picture: string;
}> => {
    try {
        const req = await fetch('https://api.myanimelist.net/v2/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!req.ok) {
            throw new GenericError(`Error de autorización o en la API: ${req.status}`);
        };

        return (await req.json()) as any;        
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();
    };
};

export default malRequestUserMe;