import logger from "./logger";

import fs from "fs";
import path from "path";
import config from "../config";
import type { Snowflake } from "discord.js";
import { Client, Collection } from "discord.js";
import type { Modal } from "../interfaces/Modal";
import type { Event } from "../interfaces/Event";
import type { Select } from "../interfaces/Select";
import type { Button } from "../interfaces/Button";
import type { Context } from "../interfaces/ContextCommand";
import type { SlashCommand } from "../interfaces/SlashCommand";
import type { PrefixedCommand } from "../interfaces/PrefixedCommand";

export default class client extends Client {
  public slashCommands: Collection<string, SlashCommand> = new Collection();
  public prefixed: Collection<string, PrefixedCommand> = new Collection();
  public events: Collection<string, Event> = new Collection();
  public buttons: Collection<string, Button> = new Collection();
  public select: Collection<string, Select> = new Collection();
  public modals: Collection<string, Modal> = new Collection();
  public contexts: Collection<string, Context> = new Collection();
  public cooldowns = new Map<string, Collection<Snowflake, number>>();
  public async start(): Promise<void> {
    this.setMaxListeners(0);
    
    await this.loadEvents(path.join(__dirname, "..", config.paths.events || "events"));
    config.loading.modals && await this.loadModals(path.join(__dirname, "..", config.paths.modals || "modals"));
    config.loading.buttons && await this.loadButtons(path.join(__dirname, "..", config.paths.buttons || "buttons"));
    config.loading.selectMenus && await this.loadSelect(path.join(__dirname, "..", config.paths.selectMenus || "select-menus"));
    config.loading.slashCommands && await this.loadSlashCommands(path.join(__dirname, "..", config.paths.slashCommands || "commands/slash"));
    config.loading.contextCommands && await this.loadContexts(path.join(__dirname, "..", config.paths.contextCommands || "commands/context"));
    config.loading.prefixedCommands && await this.loadPrefixed(path.join(__dirname, "..", config.paths.prefixedCommands || "commands/prefix"));
    
    await this.login(process.env.TOKEN).catch((error) => {
      if (error.code === "TokenInvalid") {
        logger.fatal("The provided token is invalid. Please review your .env file.")
        process.exit(1);
      }
      throw error;
    });
  }

  /**
   * Load the bot events
   * @param directory The directory to load the events from
   */
  private async loadEvents(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadEvents(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        try {
          const event: Event = await import(itemPath);
          this.events.set(event.name, event);

          if (event.once) {
            this.once(event.name, async (...args: any[]) => event.execute(this, ...args));
          } else {
            this.on(event.name, async (...args: any[]) => event.execute(this, ...args));
          }

          if (config.logging.eventLoad) {
            logger.info(`${event.name.charAt(0).toUpperCase() + event.name.slice(1)} has been hooked.`);
          }
        } catch (error) {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        }
      }
    }
  }

  /**
   * Load the slash commands
   * @param directory The directory to load the slash commands from
   */
  private async loadSlashCommands(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadSlashCommands(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        import(itemPath).then((slash: SlashCommand) => {
          this.slashCommands.set(slash.data.name, slash);
          if (config.logging.slashCommandLoad) {
            logger.info(`/${slash.data.name} has been loaded.`);
          }
        }).catch((error) => {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        })
      }
    }
  }

  /**
   * Load the prefixed commands
   * @param directory The directory to load the prefixed commands from
   */
  private async loadPrefixed(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadPrefixed(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        import(itemPath).then((prefix: PrefixedCommand) => {
          this.prefixed.set(prefix.name, prefix);
          if (config.logging.prefixedCommandLoad) {
            logger.info(`${process.env.PREFIX}${prefix.name} has been loaded.`);
          }
        }).catch((error) => {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        })
      }
    }
  }

  /**
   * Load the buttons
   * @param directory The directory to load the buttons from
   */
  private async loadButtons(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadButtons(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        import(itemPath).then((button: Button) => {
          if (button.name.includes(process.env.INTERACTION_ID_SPLIT || ":")) {
            this.buttons.set(button.name.split(process.env.INTERACTION_ID_SPLIT || ":")[0], button);
          } else {
            this.buttons.set(button.name, button);
          }

          if (config.logging.buttonLoad) {
            logger.info(`Button \"${button.name}\" has been loaded.`);
          }
        }).catch((error) => {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        })
      }
    }
  }

  /**
   * Load the select menus
   * @param directory The directory to load the select menus from
   */
  private async loadSelect(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadSelect(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        import(itemPath).then((select: Select) => {
          if (select.name.includes(process.env.INTERACTION_ID_SPLIT || ":")) {
            this.select.set(select.name.split(process.env.INTERACTION_ID_SPLIT || ":")[0], select);
          } else {
            this.select.set(select.name, select);
          }

          if (config.logging.slashCommandLoad) {
            logger.info(`Select \"${select.name}\" has been loaded.`);
          }
        }).catch((error) => {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        })
      }
    }
  }

  /**
   * Load the modals
   * @param directory The directory to load the modals from
   */
  private async loadModals(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadModals(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        import(itemPath).then((modal: Modal) => {
          if (modal.name.includes(process.env.INTERACTION_ID_SPLIT || ":")) {
            this.modals.set(modal.name.split(process.env.INTERACTION_ID_SPLIT || ":")[0], modal);
          } else {
            this.modals.set(modal.name, modal);
          }

          if (config.logging.modalLoad) {
            logger.info(`Modal \"${modal.name}\" has been loaded.`);
          }
        }).catch((error) => {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        })
      }
    }
  }

  /**
   * Load the context commands
   * @param directory The directory to load the context commands from
   */
  private async loadContexts(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        await this.loadContexts(itemPath);
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        import(itemPath).then((context: Context) => {
          if (context.data.name.includes(process.env.INTERACTION_ID_SPLIT || ":")) {
            this.contexts.set(context.data.name.split(process.env.INTERACTION_ID_SPLIT || ":")[0], context);
          } else {
            this.contexts.set(context.data.name, context);
          }

          if (config.logging.contextCommandLoad) {
            logger.info(`Context \"${context.data.name}\" has been loaded.`);
          }
        }).catch((error) => {
          logger.error(`An error occurred while loading ${itemPath}: ${error}`)
        })
      }
    }
  }
}
