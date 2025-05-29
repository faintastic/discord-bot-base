import chalk from "chalk";
import type { ChalkInstance } from "chalk";

type LogTypes = "info" | "warn" | "error" | "fatal";

export default class logger {
  /**
   * Get the current timestamp (MM/DD/YY HH:MM:SS)
   */
  private static getTimestamp(): string {
    const now = new Date();

    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Map log levels to their corresponding styles
   */
  private static getLevelStyles(level: LogTypes): { label: string; style: ChalkInstance; messageStyle?: ChalkInstance } {
    const styles: Record<LogTypes, { label: string; style: ChalkInstance; messageStyle?: ChalkInstance }> = {
      info: { label: "[INFO]", style: chalk.blue },
      warn: { label: "[WARN]", style: chalk.yellow },
      error: { label: "[ERROR]", style: chalk.red },
      fatal: { label: "[FATAL]", style: chalk.red.bold.bgBlack, messageStyle: chalk.white.bold.bgRed },
    };

    return styles[level];
  }

  /**
   * Log a message to the console
   * @param level The log level
   * @param message The message to log
   */
  public static log(level: LogTypes, message: string): void {
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
    const { label, style, messageStyle } = this.getLevelStyles(level);

    console.log(`${timestamp} ${style(label)} ${messageStyle ? messageStyle(message) : message}`);
  }

  /**
   * Log an informational message
   * @param message The message to log
   */
  public static info(message: string): void {
    this.log("info", message);
  }

  /**
   * Log a warning message
   * @param message The message to log
   */
  public static warn(message: string): void {
    this.log("warn", message);
  }

  /**
   * Log an error message
   * @param message The message to log
   */
  public static error(message: string): void {
    this.log("error", message);
  }

  /**
   * Log a fatal message
   * @param message The message to log
   */
  public static fatal(message: string): void {
    this.log("fatal", message);
  }
}