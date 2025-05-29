import client from "../../utilities/client";
import logger from "../../utilities/logger";
import { Events, Guild } from "discord.js";
import type { Execute } from "../../interfaces/Event";

export const name: Events = Events.GuildCreate;
export const execute: Execute = async (client: client, guild: Guild) => {
  logger.info(`Joined guild: ${guild.name} (${guild.id})`);
  if (process.env.BLOCK_NEW_GUILDS?.toLowerCase() === "true" && guild.id !== process.env.GUILD_ID) {
    await guild.leave();
    logger.info(`Left guild: ${guild.name} (${guild.id}) because new guilds are blocked.`);
  }
}