import {
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { RGB_COLORS } from '../../../../static/rgb-colors';

export class PatchNotesCardBuilder extends ContainerBuilder {
    public constructor(avatarURL: string) {
        super();
        this.setAccentColor(RGB_COLORS.ORANGE);

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### Últimos cambios...`));
        this.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

        this.addSectionComponents(
            new SectionBuilder()
                .setThumbnailAccessory(b => b.setURL(avatarURL))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(this.buildChangelogText()))
        );

        this.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

        this.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Dione v4.1.3`))
                .setButtonAccessory(button =>
                    button
                        .setLabel('¡Invítame a tu servidor!')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.com/oauth2/authorize?client_id=705972499367591953')
                )
        );
    }

    private buildChangelogText(): string {
        return (
            `\`08-08-2026\` Puedes usar \`/gacha trade\` para intercambiar personajes con un usuario.\n` +
            `\`06-08-2026\` Puedes usar \`/gacha inventory (user)\` para ver todos los personajes de un usuario.\n` +
            `\`03-08-2026\` Cuando se use \`/ch\` o \`/character\`, podrás indicar que deseas ese personaje.\n` +
            `▸ Al usar \`/ch\`, si un personaje es deseado por alguien se mencionará a ese usuario.\n` +
            `▸ Botón \`recompensa\` para personajes ya reclamados que otorga renas.\n` +
            `▸ El tiempo para reclamar un personaje aumentó a \`1 minuto\`.\n` +
            `\`01-08-2026\` ¡Hemos reiniciado el gacha!\n` +
            `\`29-07-2026\` Ahora puedes comprar \`pulls\` y \`claims\` en \`/gacha buy\`\n` +
            `\`27-07-2026\` Busca un personaje: \`/character\`\n` +
            `\`27-07-2026\` ¡Reclama personajes en tus servidores! \`/ch\`\n` +
            `\`25-07-2026\` Customización de perfil en \`/setup\`.\n` +
            `\`25-07-2026\` Ahora se pueden vincular cuentas de \`VNDB\`.`
        );
    }
}

