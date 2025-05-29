import color from "../utilities/color";
import client from "../utilities/client";
import type { Execute } from "../interfaces/Button";
import { ButtonInteraction, EmbedBuilder } from "discord.js";

export const name: string = "button";
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: ButtonInteraction, args) => {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()  
        .setTitle("Multi button clicked")
        .setColor(color.random)
        .setDescription(`You have clicked the \`${interaction.customId}\``)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp(),
    ]
  })
}