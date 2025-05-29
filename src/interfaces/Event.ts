import client from "../utilities/client";

export interface Execute {
  (client: client, ...args: any[]): Promise<void>;
}

export interface Event {
  name: string;
  once?: boolean;
  execute: Execute;
}