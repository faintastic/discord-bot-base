import client from "../utilities/client";
import type { Execute } from "../interfaces/Button";
import type { ModalActionRowComponentBuilder } from "discord.js";
import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export const name: string = "modal_button";
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: ButtonInteraction, args) => {
  let modal = new ModalBuilder()
    .setCustomId("button_modal")
    .setTitle("Example Modal")

  const q1 = new TextInputBuilder() 
    .setCustomId("q1")
    .setMaxLength(400)
    .setLabel("This is a short answer")
    .setStyle(TextInputStyle.Short)

    const q2 = new TextInputBuilder() 
      .setCustomId("q2")
      .setMaxLength(400)
      .setLabel("This is a long answer (paragraph)")
      .setStyle(TextInputStyle.Paragraph)

    const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([q1]);
    const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([q2]);
  
    modal.addComponents([firstActionRow, secondActionRow]);
  
    await interaction.showModal(modal)
}