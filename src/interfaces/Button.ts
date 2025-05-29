import client from "../utilities/client";
import { ButtonInteraction } from "discord.js";

export interface Execute {
  (client: client, interaction: ButtonInteraction, args?: string[]): Promise<void>
}

export interface Button {
  name: string;
  cooldown?: number;
  execute: Execute;
}