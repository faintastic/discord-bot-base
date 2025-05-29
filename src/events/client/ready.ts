import client from "../../utilities/client";
import presence from "../../../presence.json";
import logger from "../../utilities/logger";
import { REST } from "@discordjs/rest";
import type { PresenceStatusData } from "discord.js";
import type { Execute } from "../../interfaces/Event";
import { ActivityType, Events, Routes } from "discord.js";

export const name: Events = Events.ClientReady;
export const execute: Execute = async (client: client) => {
  logger.info(`Logged in as ${client.user?.tag} (${client.user?.id})\n`);

  const activityTypes: Record<string, ActivityType> = {
    PLAYING: ActivityType.Playing,
    STREAMING: ActivityType.Streaming,
    LISTENING: ActivityType.Listening,
    WATCHING: ActivityType.Watching,
    COMPETING: ActivityType.Competing,
  };

  const activityType = activityTypes[presence.type.toUpperCase()] || ActivityType.Playing;

  client.user?.setPresence({
    status: presence.status as PresenceStatusData,
    activities: [
      {
        name: presence.name,
        type: activityType,
        url: presence.url || undefined,
      },
    ],
  });
  logger.info("Bot presence has been set.");

  const rest = new REST().setToken(process.env.TOKEN as string);

  const slashCommands = client.slashCommands.map((command) => command.data.toJSON());
  const contextCommands = client.contexts.map((context) => context.data.toJSON());
  const allCommands = [...slashCommands, ...contextCommands];

  if (allCommands.length > 0) {
    try {
      if (process.env.GLOBAL_COMMANDS?.toLowerCase() === "true") {
        await rest.put(Routes.applicationCommands(client.user?.id as string), { body: allCommands });
        logger.info("Successfully registered global slash and context menu commands.");
      } else {
        await rest.put(Routes.applicationGuildCommands(client.user?.id as string, process.env.GUILD_ID as string), { body: allCommands });
        logger.info("Successfully registered guild slash and context menu commands.");
      }
    } catch (error: any) {
      logger.error(`An error occurred while registering commands: ${error}\n${error.stack}`);
    }
  }
};
