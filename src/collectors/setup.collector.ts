import { ButtonInteraction, MessageFlags, ModalSubmitInteraction } from "discord.js";
import SetupModalComponent from "../builders/components/setupModal.component";
import ComponentsID from "../static/componentsId";
import mongo from "../database/mongo";
import * as uuid from 'uuid';
import { UUID } from "mongodb";
import SetupSuccessEmbed from "../builders/embeds/setupSuccess.embed";
import viewerRequest from "../requests/viewer.request";
import ErrorEmbed from "../builders/embeds/error.embed";
import responsesHelper from "../helpers/responses.helper";

const execute = async (collected: ButtonInteraction) => {
    let collectedModal: ModalSubmitInteraction | null = null;
    try {
        await collected.showModal(new SetupModalComponent());
        collectedModal = await collected.awaitModalSubmit({ time: 300_000 });
    
        const token = collectedModal.fields.getTextInputValue(ComponentsID.SetupInput);
        const viewer = await viewerRequest.execute(token);
    
        const members = mongo.collection('members');
        const member = await members.findOne({ discord_id: collected.user.id });
    
        if (member) {
            await members.updateOne(
                { _id: member._id },
                { $set: { anilist: { id: viewer.id, token } } }
            );
        } else {
            const _id = uuid.v7();
    
            await members.insertOne({
                _id: new UUID(_id) as any,
                discord_id: collected.user.id,
                anilist: {
                    id: viewer.id,
                    token: token
                },
                guilds: [
                    {
                        id: collected.guild?.id,
                        show_scores: true
                    }
                ]
            })
        };
    
        await collectedModal.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SetupSuccessEmbed(viewer.name, viewer.siteUrl)]
        });
    } catch (error: any) {
        console.error(error);
        
        if (collectedModal) {
            await responsesHelper.execute(collectedModal, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        } else {
            await responsesHelper.execute(collected, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        };
    };
};

const setupCollector = {
    execute
};

export default setupCollector;