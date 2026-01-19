import type { ClientEvents } from 'discord.js';
import { z } from 'zod';

export interface MarshalEventContext {
  args: Record<string, unknown>;
}

export type EventFunction = (e: ClientEvents[keyof ClientEvents]) => Promise<void>;

export enum ClientEvent {
  ready = 'ready',
  guildMemberAdd = 'guildMemberAdd',
  guildMemberUpdate = 'guildMemberUpdate',
  messageCreate = 'messageCreate',
}

export const EventSpecSchema = z.object({
  event: z.nativeEnum(ClientEvent),
});
export type EventSpec = z.infer<typeof EventSpecSchema>;

export const EventMetaSchema = z.object({
  spec: EventSpecSchema,
  functionName: z.string().nonempty(),
});
export type EventMeta = z.infer<typeof EventMetaSchema>;
export type LinkedEventMeta = EventMeta & {
  function: EventFunction;
};
