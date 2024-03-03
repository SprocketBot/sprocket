import {Injectable, Logger} from "@nestjs/common";
import * as config from "config";
import type {Message} from "discord.js";

import type {
    CommandArg, CommandSpec, LinkedCommandMeta, LinkedCommandNotFoundMeta,
} from "./commands.types";

@Injectable()
export class CommandManagerService {
    private static readonly COMMAND_ARG_KEY_SEP = "__";

    /**
     * List of all registered commands/aliases
     */
    private _commands = new Map<string, LinkedCommandMeta>();

    /**
     * List of all registered command not found hooks
     */
    private _commandNotFoundHooks = new Set<LinkedCommandNotFoundMeta>();

    private readonly _logger = new Logger(CommandManagerService.name);

    /**
     * Gets all non-alias command specs. Useful when displaying command metadata
     * to users. Should not be used for executing a command, instead use {@link handleMessage}.
     */
    get commands(): CommandSpec[] {
        const values = [...this._commands.values()];
        return values.filter(v => !v.isAlias).map(meta => meta.spec);
    }

    /**
     * Given some discord message, runs all hooks that match it
     */
    async handleMessage(message: Message): Promise<void> {
        const commandName = this.extractCommandName(message.content);
        if (!commandName) return;

        const inputArgs = this.splitArgs(message.content);
        const key = this.buildKey(commandName, inputArgs.length);

        if (typeof commandName === "string") {
            const meta = this._commands.get(key);
            if (meta) {
                // If a matching command is found, execute it
                const args = this.parseArgs(inputArgs, meta.spec.args);
                await meta.function(message, {args: args, author: false});
            } else {
                // Otherwise, if the prefix matches execute all CommandNotFound hooks
                await Promise.all(Array.from(this._commandNotFoundHooks).map(async hook => hook.function(message)));
            }
        }
    }

    /**
     * Registers a command so that it can be called by discord messages
     */
    registerCommand(meta: LinkedCommandMeta): void {
        const originalAliases = [meta.spec.name, ...meta.spec.aliases ?? []];

        for (const alias of originalAliases) {
            const _aliases = [...meta.spec.aliases ?? []];

            // Build command using aliasName and number of arguments
            const key = this.buildKey(alias, meta.spec.args.length);
            if (this._commands.has(key)) {
                throw new Error(`Error: Command "${alias}" with ${meta.spec.args.length} arguments was declared more than once!`);
            }
            this._logger.debug(`Registering command ${key}`);

            let aliasedMeta: LinkedCommandMeta | undefined;

            // If aliasName is not original name
            if (alias !== meta.spec.name) {
                // Find and remove from aliases
                const aliasIndex = _aliases.findIndex(a => a === alias);
                _aliases.splice(aliasIndex, 1);

                // Add original name to aliases
                _aliases.unshift(meta.spec.name);

                // Set name and aliases to swapped data
                aliasedMeta = {
                    ...meta,
                    spec: {
                        ...meta.spec,
                        name: alias,
                        aliases: _aliases,
                    },
                    isAlias: true,
                };
            }

            this._commands.set(key, aliasedMeta ?? meta);
        }
    }

    /**
     * Registers a not found hook so that it can be called
     */
    registerNotFoundCommand(meta: LinkedCommandNotFoundMeta): void {
        this._commandNotFoundHooks.add(meta);
    }

    getCommandSpecs(commandName: string): CommandSpec[] {
        const keys = [...this._commands.keys()];
        const matchingKeys = keys.filter(k => k.startsWith(`${commandName}${CommandManagerService.COMMAND_ARG_KEY_SEP}`));

        const matchingSpecs: CommandSpec[] = [];
        for (const mk of matchingKeys) {
            const meta = this._commands.get(mk)!;
            matchingSpecs.push(meta.spec);
        }
        return matchingSpecs;
    }

    /**
     * Identifies if a command key could exist, and returns it
     * @returns {string} Command key,
     */
    private extractCommandName(message: string): string | undefined {
        let commandKey = message.split(" ")[0].toLowerCase();

        const prefix = config.has("bot.prefix") ? `${config.get("bot.prefix")}` : "";
        if (commandKey.startsWith(prefix)) {
            commandKey = commandKey.slice(prefix.length);
            return commandKey.toLowerCase();
        }
        // Failing to include a prefix will cause this to match nothing
        return undefined;
    }

    private splitArgs(message: string): string[] {
        const messageChunks = message.split(" ");
        const argChunks = messageChunks.slice(1);
        const args: string[] = [];

        for (let i = 0; i < argChunks.length; i++) {
            const localArg: string[] = [];

            if (argChunks[i].startsWith("\"")) {
                do {
                    localArg.push(argChunks[i].replace(/(?<!\\)"/, ""));

                    if (argChunks[i].endsWith("\"") && !argChunks[i].endsWith("\\\"")) break;
                } while (++i < argChunks.length);

                args.push(localArg.join(" "));
            } else {
                args.push(argChunks[i]);
            }
        }

        return args;
    }

    // TODO refactor this into another service?
    // TODO increase test coverage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parseArgs(inputArgs: string[], args: CommandArg[]): Record<string, any> {
        if (inputArgs.length !== args.length) {
            throw new Error(`Cannot parse arguments with mismatching length, (${inputArgs.length} !== ${args.length})`);
        }

        const parsed = {};

        for (let i = 0; i < inputArgs.length; i++) {
            const input = inputArgs[i];
            const arg = args[i];

            switch (arg.type) {
                case "string":
                    parsed[arg.name] = input;
                    break;
                case "number":
                    parsed[arg.name] = parseInt(input);
                    break;
                case "mention": {
                    const m = input.match(/^<@!(\d+)>$/);
                    if (!m) {
                        throw new Error(`Unable to parse mention argument \`${input}\``);
                    }
                    // const member = // TODO find org Member by mention ID
                    parsed[arg.name] = {
                        discordId: m[1],
                        name: "TODO find org Member by mention ID",
                    };
                    break;
                }
                default:
                    throw new Error(`Unable to parse arg with unknown arg type=${arg.type}`);
            }
        }

        return parsed;
    }

    private buildKey(alias: string, numArgs: number): string {
        return `${alias}${CommandManagerService.COMMAND_ARG_KEY_SEP}${numArgs}`.toLowerCase();
    }
}
