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
                // We kinda need to act on faith here, if the implementer has decorated an unsafe function, we can't tell until runtime.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
                function: Reflect.get(this, meta.functionName).bind(this) as CommandFunction,
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
                // We kinda need to act on faith here, if the implementer has decorated an unsafe function, we can't tell until runtime.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
                function: Reflect.get(this, meta.functionName).bind(this),
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
            // We kinda need to act on faith here, if the implementer has decorated an unsafe function, we can't tell until runtime.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const f = Reflect.get(this, meta.functionName).bind(this) as EventFunction;
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
}
