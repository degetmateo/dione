import { EmbedBuilder, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { ObjectId } from "mongodb";
import ErrorEmbed from "../embeds/errorEmbed";
import mongo from "../database/mongo";
import vndb from "../apis/vndb/vndb";

module.exports = {
    id: 'setup-instructions-vndb-modal',
    execute: async (interaction: ModalSubmitInteraction, member: {
        _id: ObjectId;
        discord_id: string;
        key: string;
    }) => {
        const members = mongo.collection('members');
        
        if (!member) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
            });
        };

        if (interaction.user.id != member.discord_id) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('No tienes permiso para realizar esta acción.')]
            });
        };

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const token = interaction.fields.getTextInputValue('setup-instructions-vndb-input');

        if (!token) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('Has introducido un código no válido.')]
            });
        };
        
        const authinfo = await vndb.auth(token);

        await members.updateOne(
            { 
                _id: member._id
            },
            {
                $set: {
                    vndb: {
                        id: authinfo.id,
                        username: authinfo.username,
                        auth: {
                            token: token,
                            permissions: authinfo.permissions
                        }
                    }
                }
            }
        );

        const embed = new EmbedBuilder();
        embed.setColor('Random');
        embed.setDescription(
            `Has iniciado sesión correctamente como [${authinfo.username}](https://vndb.org/${authinfo.id}).`
        );

        return await interaction.editReply({
            embeds: [embed]
        });  
    }
};