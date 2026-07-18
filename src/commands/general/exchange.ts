import { SlashCommandBuilder, InteractionContextType } from "discord.js";
import exchangeCommandExecute from "./execute/exchange/exchange.command.execute";

module.exports = {
    // cooldown: 25,
    data: new SlashCommandBuilder()
        .setName('exchange')
        .setDescription('Comandos relacionados a intercambios de animes/mangas.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subcommand => {
            return subcommand
                .setName('help')
                .setDescription('Ayuda acerca de los intercambios.')
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName('create')
                .setDescription('Iniciar un intercambio con otro usuario.')
                .addUserOption(option => 
                    option
                        .setName('member')
                        .setDescription('El otro usuario para el intercambio.')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName('media-type')
                        .setDescription('Tipo de obra a intercambiar.')
                        .setRequired(true)
                        .addChoices([{ name: "ANIME", value: "ANIME" }, { name: "MANGA", value: "MANGA" }])
                )
                .addNumberOption(option =>
                    option
                        .setName('media-id')
                        .setDescription('ID de la obra a intercambiar (anilist).')
                        .setRequired(true)
                )
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName('complete')
                .setDescription('Decidir si el otro usuario completó su parte del intercambio.')
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName('cancel')
                .setDescription('Cancelar el intercambio que tienes activo.')
        }),
    execute: exchangeCommandExecute
};