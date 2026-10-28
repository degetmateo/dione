import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { BusinessRuleError } from '../../../core/errors/business-rule-error';
import { ValidationError } from '../../../core/errors/validation-error';
import SettingsModule from '../../../modules/settings.module';
import Helpers from '../../../helpers';
import Bot from '../../../bot/bot';

export class EvalCommand extends BaseSlashCommand {
    public readonly name = 'eval';
    public readonly data = new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Developer controls.')
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => opt.setName('value').setDescription('Expression to execute').setRequired(true));

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.user.id !== process.env.DEV_ID) {
            throw new BusinessRuleError('Unauthorized: Solo el desarrollador puede ejecutar este comando.');
        }

        const value = interaction.options.getString('value', true);
        const [prefix, param] = value.split(' ');
        const bot = interaction.client as Bot;

        if (prefix === 'ccc') {
            if (!param || !Helpers.isNumber(param)) throw new ValidationError('Cooldown numérico requerido.');
            bot.settings.character_claim_cooldown = Number(param);
            await SettingsModule.save(bot.settings);
            await interaction.reply({ content: `Claim cooldown actualizado a ${param}s.`, flags: 'Ephemeral' });
            return;
        }

        if (prefix === 'renas') {
            if (!param || !Helpers.isNumber(param)) throw new ValidationError('Monto de renas numérico requerido.');
            bot.settings.renas_per_reclaim = Number(param);
            await SettingsModule.save(bot.settings);
            await interaction.reply({ content: `Renas por reclaim actualizadas a ${param}.`, flags: 'Ephemeral' });
            return;
        }

        if (prefix === 'maintenance') {
            const isMaint = Number(param) === 1;
            bot.settings.maintenance = isMaint;
            await SettingsModule.save(bot.settings);
            await interaction.reply({ content: `Mantenimiento: ${isMaint ? 'ACTIVADO' : 'DESACTIVADO'}.`, flags: 'Ephemeral' });
            return;
        }

        await interaction.reply({ content: 'Prefijo no reconocido (opciones: ccc, renas, maintenance).', flags: 'Ephemeral' });
    }
}

