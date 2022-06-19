import type {Message} from "discord.js";
import {z} from "zod";

export interface MarshalCommandContext {
    args: Record<string, unknown>;
    author: {
        id: string;
    } | false;
}

export type CommandFunction = (m: Message, c: MarshalCommandContext) => Promise<unknown>;
export type HookFunction = (m: Message) => Promise<unknown>;

export const CommandRoleSchema = z.enum([
    "MEMBER",
]);
export type CommandRole = z.infer<typeof CommandRoleSchema>;

export const CommandArgTypeSchema = z.enum([
    "number",
    "string",
    "mention",
]);
export type CommandArgType = z.infer<typeof CommandArgTypeSchema>;

export const CommandArgSchema = z.object({
    name: z.string().nonempty(),
    type: CommandArgTypeSchema,
    docs: z.string().nonempty(),
});
export type CommandArg = z.infer<typeof CommandArgSchema>;

export const CommandSpecSchema = z.object({
    name: z.string().nonempty(),
    aliases: z.optional(z.array(z.string().nonempty())),
    roles: z.optional(z.array(CommandRoleSchema)),
    args: z.array(CommandArgSchema),
    docs: z.string().nonempty(),
    longDocs: z.optional(z.string().nonempty()),
});
export type CommandSpec = z.infer<typeof CommandSpecSchema>;

export const CommandMetaSchema = z.object({
    spec: CommandSpecSchema,
    functionName: z.string().nonempty(),
    isAlias: z.optional(z.boolean()),
});
export type CommandMeta = z.infer<typeof CommandMetaSchema>;
export type LinkedCommandMeta = CommandMeta & {
    function: CommandFunction;
};

export const CommandNotFoundMetaSchema = z.object({
    functionName: z.string().nonempty(),
});
export type CommandNotFoundMeta = z.infer<typeof CommandNotFoundMetaSchema>;
export type LinkedCommandNotFoundMeta = CommandNotFoundMeta & {
    function: HookFunction;
};
