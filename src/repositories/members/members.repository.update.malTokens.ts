import mongo from "../../database/mongo";
import GenericError from "../../errors/genericError";

const membersRepositoryUpdateMalTokens = async (discord_id: string, tokens: any) => {
    try {
        const members = mongo.collection('members');

        await members.updateOne(
            { discord_id: discord_id },
            { 
                $set: {
                    'mal.auth.access_token': tokens.access_token,
                    'mal.auth.refresh_token': tokens.refresh_token
                } 
            }
        );
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();
    };
};

export default membersRepositoryUpdateMalTokens;