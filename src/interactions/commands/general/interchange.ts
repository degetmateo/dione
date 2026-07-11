import { SlashCommandBuilder, InteractionContextType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import GenericError from "../../../errors/genericError";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import InterchangeCommandInteraction from "../../../command-interactions/interchange/interchangeCommandInteraction";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interchange')
        .setNameLocalization('es-ES', 'intercambio')
        .setNameLocalization('es-419', 'intercambio')
        .setDescription('Interchange-related commands.')
        .setDescriptionLocalization('es-ES', 'Comandos relacionados con intercambios.')
        .setDescriptionLocalization('es-419', 'Comandos relacionados con intercambios.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addSubcommandGroup(subcommandGroup => 
            subcommandGroup
                .setName('create')
                .setNameLocalization('es-ES', 'crear')
                .setNameLocalization('es-419', 'crear')
                .setDescription('Create a new interchange.')
                .setDescriptionLocalization('es-ES', 'Crear un nuevo intercambio.')
                .setDescriptionLocalization('es-419', 'Crear un nuevo intercambio.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('member')
                        .setNameLocalization('es-ES', 'miembro')
                        .setNameLocalization('es-419', 'miembro')
                        .setDescription('Start an interchange with a member.')
                        .setDescriptionLocalization('es-ES', 'Iniciar un intercambio con un miembro.')
                        .setDescriptionLocalization('es-419', 'Iniciar un intercambio con un miembro.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setNameLocalization('es-ES', 'usuario')
                                .setNameLocalization('es-419', 'usuario')
                                .setDescription('The member to start the interchange with.')
                                .setDescriptionLocalization('es-ES', 'El miembro con el que iniciar el intercambio.')
                                .setDescriptionLocalization('es-419', 'El miembro con el que iniciar el intercambio.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName('server')
                        .setNameLocalization('es-ES', 'servidor')
                        .setNameLocalization('es-419', 'servidor')
                        .setDescription('Start an interchange in a server.')
                        .setDescriptionLocalization('es-ES', 'Iniciar un intercambio en un servidor.')
                        .setDescriptionLocalization('es-419', 'Iniciar un intercambio en un servidor.')
                )
        ),
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            await (new InterchangeCommandInteraction(interaction)).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};