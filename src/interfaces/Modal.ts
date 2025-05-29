import client from "../utilities/client";
import { ModalSubmitInteraction, ModalSubmitFields } from "discord.js";

export interface Execute {
  (client: client, interaction: ModalSubmitInteraction, fields: ModalSubmitFields): Promise<void>
}

export interface Modal {
  name: string;
  cooldown?: number;
  execute: Execute;
}