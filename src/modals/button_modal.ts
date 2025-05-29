import color from "../utilities/color";
import client from "../utilities/client";
import type { Execute } from "../interfaces/Modal";
import { ModalSubmitInteraction, EmbedBuilder } from "discord.js";

export const name: string = "button_modal";
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: ModalSubmitInteraction, fields) => {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()  
        .setTitle("Modal Button Response")
        .setColor(color.random)
        .setDescription(`Answer One: ${fields.getTextInputValue("q1")}\nAnswer Two: ${fields.getTextInputValue("q2")}`)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp(),
    ]
  })
}