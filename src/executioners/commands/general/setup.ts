import { Interaction, InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import SetupInstructionsEmbed from "../../../builders/embeds/setupInstructions.embed";
import SetupButtonsComponent from "../../../builders/components/setupButtons.component";
import setupCollector from "../../../collectors/setup.collector";
import responsesHelper from "../../../helpers/responses.helper";
import ErrorEmbed from "../../../embeds/errorEmbed";

const execute = async (interaction: BChatInputCommandInteraction) => {
    try {
        const response = await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SetupInstructionsEmbed()],
            components: [new SetupButtonsComponent()]
        });

        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async (collectedInteraction: Interaction) => {
            if (collectedInteraction.isButton()) {
                await setupCollector.execute(collectedInteraction);
            };
        });
    } catch (error: any) {
        console.error(error);
        await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
    };
};

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Sign in with your Anilist account.')
        .setDescriptionLocalization('es-ES', 'Inicia sesión con tu cuenta de Anilist.')
        .setDescriptionLocalization('es-419', 'Inicia sesión con tu cuenta de Anilist.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild),
    execute: execute
};