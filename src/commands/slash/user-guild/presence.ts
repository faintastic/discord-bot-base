import color from "../../../utilities/color";
import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/SlashCommand";
import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  ActivityType
} from "discord.js";
import type { PresenceStatusData } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("presence")
  .setDescription("Set discord bot presence")
  .addStringOption((option) =>
    option
      .setName("status")
      .setDescription("Change the state of the bot")
      .setChoices([
        { value: "online", name: "Online" },
        { value: "idle", name: "Idle" },
        { value: "dnd", name: "Do Not Disturb" },
        { value: "invisible", name: "Invisible" },
      ])
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("activity")
      .setDescription("Change the activity of the bot")
      .setChoices([
        { value: "PLAYING", name: "Playing" },
        { value: "STREAMING", name: "Streaming" },
        { value: "LISTENING", name: "Listening to" },
        { value: "WATCHING", name: "Watching" },
        { value: "COMPETING", name: "Competing in" },
      ])
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("The text that will be displayed")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("The url that will be displayed (only for STREAMING)")
  )
  .addBooleanOption((option) =>
    option
      .setName("save")
      .setDescription(
        "If false the presence will be set only for the current session"
      )
  )
  .setContexts(0, 1, 2) // 0 = GUILD || 1 = BOT_DM || 2 = PRIVATE_CHANNEL (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
  .setIntegrationTypes(0, 1); // 0 = GUILD_INSTALL || 1 = USER_INSTALL (https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
export const cooldown: number = 5;
export const execute: Execute = async (
  client: client,
  interaction: CommandInteraction,
  args
) => {
  await interaction.deferReply({});
  const status = args.get("status")?.value?.toString();
  const activity = args.get("activity")?.value?.toString() || "";
  const name = args.get("name")?.value?.toString() || "";
  const url = args.get("url")?.value?.toString();
  const save = args.get("save")?.value;

  const activityTypes: Record<string, ActivityType> = {
    PLAYING: ActivityType.Playing,
    STREAMING: ActivityType.Streaming,
    LISTENING: ActivityType.Listening,
    WATCHING: ActivityType.Watching,
    COMPETING: ActivityType.Competing,
  };

  if (activity === "STREAMING" && !url) {
    await interaction.editReply({
      content: "",
      embeds: [
        new EmbedBuilder()
          .setTitle("Error while setting presence")
          .setDescription(`You need to provide a url for the activity`)
          .setColor(color.error)
          .setTimestamp(),
      ],
    });
    return;
  }

  client.user?.setPresence({
    status: status as PresenceStatusData,
    activities: [
      {
        name: name,
        type: activityTypes[activity] || ActivityType.Playing,
        url: url,
      },
    ],
  })

  if (save) {
    const fs = require("fs");
    const path = require("path");
    const presence = {
      status: status,
      type: activity,
      name: name,
      url: url || "",
    };
    fs.writeFileSync(
      path.resolve(__dirname, "../../../../presence.json"),
      JSON.stringify(presence, null, 2)
    );
  }

  await interaction.editReply({
    content: "",
    embeds: [
      new EmbedBuilder()
        .setTitle("Presence has been set")
        .setDescription(`Status: \`${status}\`\nActivity: \`${activity}\`\nName: \`${name}\`\nUrl: \`${url || "N/A"}\`\nSave: \`${save || "false"}\``)
        .setColor(color.success)
        .setTimestamp(),
    ],
  });
};
