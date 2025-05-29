import color from "../utilities/color";
import client from "../utilities/client";
import { EmbedBuilder } from "discord.js";
import type { Execute } from "../interfaces/Select";
import type { AnySelectMenuInteraction } from "discord.js";

export const name: string = "user_select";
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: AnySelectMenuInteraction, args) => {
  const selectedUser = args && args[0] ? `<@${args[0]}>` : 'No user selected';

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("User select clicked")
        .setColor(color.random)
        .setDescription(`You have selected ${selectedUser}`)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp(),
    ]
  });
};