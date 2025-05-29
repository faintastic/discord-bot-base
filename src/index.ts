import "dotenv/config"; 
import client from "./utilities/client";
import logger from "./utilities/logger";
import { GatewayIntentBits, Partials } from "discord.js";

const requiredVariables = ["TOKEN", "PREFIX", "GUILD_ID"];
const errors: string[] = [];
for (const variable of requiredVariables) {
  if (process.env[variable]?.length === 0) {
    errors.push(`Missing the ${variable} environment variable`);
  }
}

if (errors.length) {
  logger.fatal(`Failed to start the bot due to the following errors: ${errors.join(", ")}`);
  process.exit(1);
}

try { 
  new client({
    intents: [
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildScheduledEvents,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
    partials: [
      Partials.Channel,
      Partials.GuildMember,
      Partials.GuildScheduledEvent,
      Partials.Reaction,
      Partials.ThreadMember,
      Partials.User,
    ],
  }).start();
} catch (err: any) {
  logger.fatal(`An error occurred while starting the bot: ${err}\n${err.stack}`);
}
