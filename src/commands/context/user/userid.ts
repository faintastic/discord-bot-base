import color from "../../../utilities/color";
import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/ContextCommand";
import { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, UserContextMenuCommandInteraction } from "discord.js";

export const data = new ContextMenuCommandBuilder()
  .setName("userid")
  // @ts-ignore
  .setType(ApplicationCommandType.User)

export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: UserContextMenuCommandInteraction, args: any) => {
  await interaction.deferReply({ ephemeral: true });

  await interaction.followUp({
    embeds: [
      new EmbedBuilder()
        .setTitle("User ID")
        .setColor(color.random)
        .setDescription(`The user's id is \`${interaction.targetId}\``)
        .setTimestamp(),
    ]
  });
}
