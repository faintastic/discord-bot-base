import color from "../../../utilities/color";
import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/ContextCommand";
import { MessageContextMenuCommandInteraction, EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, UserContextMenuCommandInteraction } from "discord.js";

export const data = new ContextMenuCommandBuilder()
  .setName("messageid")
  // @ts-ignore
  .setType(ApplicationCommandType.Message)

export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: MessageContextMenuCommandInteraction, args: any) => {
  await interaction.deferReply({ ephemeral: true });

  await interaction.followUp({
    embeds: [
      new EmbedBuilder()
        .setTitle("Message ID")
        .setColor(color.random)
        .setDescription(`The message ID is \`${interaction.targetId}\``)
        .setTimestamp(),
    ]
  });
}
