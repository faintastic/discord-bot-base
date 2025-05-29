export default class color {
  public static default: number = 0xFFFFFF;
  public static error: number = 0xFF0000;
  public static success: number = 0x00FF00;
  public static noperms: number = 0xFFA500;
  public static loading: number = 0xFFFF00;

  public static get random(): number {
    return Math.floor(Math.random() * 0xFFFFFF);
  }
}