import { EmbedBuilder, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { ObjectId } from "mongodb";
import ErrorEmbed from "../embeds/errorEmbed";
import mongo from "../database/mongo";
import mal from "../apis/mal/mal";

module.exports = {
    id: 'setup-instructions-mal-modal',
    execute: async (interaction: ModalSubmitInteraction, data: {
        _id: ObjectId;
        discord_id: string;
        key: string;
        code_verifier: string;
    }) => {
        if (!data) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
            });
        };

        if (interaction.user.id != data.discord_id) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('No tienes permiso para realizar esta acción.')]
            });
        };

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const codes = interaction.fields.getTextInputValue('setup-instructions-mal-input');
        const values = codes.split('_');
        const code = values[0];
        const state = values[1];

        if (!code) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('Has introducido un código no válido.')]
            });
        };

        if (!state) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('Has introducido un código no válido.')]
            });
        };

        if (interaction.user.id != state) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('No tienes permiso para realizar esta acción.')]
            });
        };

        const tokens = await mal.token(code, data.code_verifier);
        const maluser = await mal.user.me(tokens.access_token);
        
        const members = mongo.collection('members');

        await members.updateOne(
            { _id: data._id },
            {
                $set: {
                    preferred_platform: 'mal',
                    mal: {
                        id: maluser.id,
                        joined_at: new Date(maluser.joined_at),
                        auth: {
                            token_type: tokens.token_type,
                            expires_in: tokens.expires_in,
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token
                        }
                    }
                }
            }
        );

        const embed = new EmbedBuilder();
        embed.setThumbnail(maluser.picture);
        embed.setColor('Random');
        embed.setDescription(
            `Has iniciado sesión correctamente como [${maluser.name}](https://myanimelist.net/profile/${maluser.name}). Utiliza \`/show-scores\` para decidir si mostrar tus puntuaciones en este servidor.`
        );

        return interaction.editReply({
            embeds: [embed]
        });
    }
};