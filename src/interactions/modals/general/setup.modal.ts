import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import * as uuid from 'uuid';
import ComponentsID from "../../../static/componentsId";
import Anilist from "../../../services/anilist";
import mongo from "../../../database/mongo";
import { UUID } from "mongodb";
import SuccessEmbed from "../../../embeds/successEmbed";
import ErrorEmbed from "../../../embeds/errorEmbed";

module.exports = {
    id: ComponentsID.SetupModal,
    execute: async (interaction: ModalSubmitInteraction) => {
        try {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const token = interaction.fields.getTextInputValue(ComponentsID.SetupInput);

            const query = `
                query {
                    Viewer {
                        id
                        name
                        siteUrl
                        avatar {
                            large
                        }
                        options {
                            profileColor                    
                        }   
                    }
                }
            `;

            const results = await Anilist.authorizedQuery(query, token);
            const viewer = results.Viewer;

            const members = mongo.collection('members');
            const member = await members.findOne({ discord_id: interaction.user.id });

            if (member) {
                await members.updateOne(
                    { _id: member._id },
                    { $set: { anilist: { id: viewer.id, token } } }
                );
            } else {
                const _id = uuid.v7();

                await members.insertOne({
                    _id: new UUID(_id) as any,
                    discord_id: interaction.user.id,
                    anilist: {
                        id: viewer.id,
                        token: token
                    },
                    guilds: [
                        {
                            id: interaction.guild?.id,
                            show_scores: true
                        }
                    ]
                })
            };

            await interaction.editReply({
                embeds: [new SuccessEmbed((`
                    Autentificación completada correctamente como [${viewer.name}](${viewer.siteUrl}). Utilizá \`/show-scores\` para decidir si mostrar tus puntuaciones en este servidor.
                `).trim())]
            });
        } catch (error: any) {
            console.error(error);
            await interaction.editReply({
                embeds: [new ErrorEmbed(error.message)]
            }); 
        }
    }
};