import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {AnalyticsService, CoreService} from "@sprocketbot/common";
import type {ClientEvents} from "discord.js";
import {Client} from "discord.js";
import * as zod from "zod";

import {EmbedService} from "../embed/embed.service";
import type {EventFunction} from ".";
import {
    CommandMetaSchema, EventMetaSchema, MarshalMetadataKey,
} from ".";
import type {CommandFunction} from "./commands";
import {CommandNotFoundMetaSchema} from "./commands";
import {CommandManagerService} from "./commands/command-manager.service";

/**
 * The marshal implements hidden functionality that is called at construction time to wire up all decorators provided by the Marshal Module
 * It must be used if you use any decorators from the Marshal Module (i.e. @Command)
 */
@Injectable()
export abstract class Marshal {
    private readonly _logger = new Logger(Marshal.name);

    constructor(
        protected readonly cms: CommandManagerService,
        protected readonly coreService: CoreService,
        protected readonly analyticsService: AnalyticsService,
        protected readonly embedService: EmbedService,
        @Inject("DISCORD_CLIENT") protected readonly botClient: Client,
    ) {
        this.registerAllCommands(cms);
        this.registerAllCommandNotFoundHooks(cms);
        this.registerAllEvents();
    }

    private registerAllCommands(cms: CommandManagerService): void {
        const marshalMetadata: unknown = Reflect.getMetadata(MarshalMetadataKey.Command, this);
        if (!marshalMetadata) return;
        const parseResult = zod.array(CommandMetaSchema).safeParse(marshalMetadata);
        if (!parseResult.success) {
            this._logger.error(parseResult);
            return;
        }
        const {data} = parseResult;

        data.forEach(meta => {
            // Do things
            cms.registerCommand({
                ...meta,
                function: this.getBoundFunction<CommandFunction>(meta.functionName),
            });
            this._logger.debug(`Registered Command ${meta.spec.name}`);
        });
    }

    private registerAllCommandNotFoundHooks(cms: CommandManagerService): void {
        const marshalMetadata: unknown = Reflect.getMetadata(MarshalMetadataKey.CommandNotFound, this);
        if (!marshalMetadata) return;
        const parseResult = zod.array(CommandNotFoundMetaSchema).safeParse(marshalMetadata);
        if (!parseResult.success) {
            this._logger.error(parseResult);
            return;
        }
        const {data} = parseResult;

        data.forEach(meta => {
            // Do things
            cms.registerNotFoundCommand({
                ...meta,
                function: this.getBoundFunction(meta.functionName),
            });
        });
    }

    private registerAllEvents(): void {
        const marshalMetadata: unknown = Reflect.getMetadata(MarshalMetadataKey.Event, this);
        if (!marshalMetadata) return;
        const parseResult = zod.array(EventMetaSchema).safeParse(marshalMetadata);
        if (!parseResult.success) {
            this._logger.error(parseResult);
            return;
        }
        const {data} = parseResult;

        data.forEach(meta => {
            const f = this.getBoundFunction<EventFunction>(meta.functionName);
            // Do things
            this.botClient.on(
                meta.spec.event,
                async (...args: ClientEvents[keyof ClientEvents]): Promise<void> => {
                    await f(args).catch(e => {
                        this._logger.error(e);
                    });
                },
            );
            this._logger.debug(`Registered Event ${meta.spec.event}`);
        });
    }

    private getBoundFunction<TFunction extends (...args: any[]) => unknown>(functionName: string): TFunction {
        const handler = Reflect.get(this, functionName) as unknown;
        if (typeof handler !== "function") {
            throw new Error(`Marshal handler ${functionName} is not a function`);
        }
        return handler.bind(this) as TFunction;
    }
}
