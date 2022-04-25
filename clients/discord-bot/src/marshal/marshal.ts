import {Injectable, Logger} from "@nestjs/common";
import {AnalyticsService, GqlService} from "@sprocketbot/common";
import * as zod from "zod";

import {EmbedService} from "../embed/embed.service";
import {CommandMetaSchema} from ".";
import {CommandManagerService} from "./command-manager/command-manager.service";
import type {CommandFunction} from "./types";
import {CommandNotFoundMetaSchema, MarshalMetadataKey} from "./types";

/**
 * The marshal implements hidden functionality that is called at construction time to wire up all decorators provided by the Marshal Module
 * It must be used if you use any decorators from the Marshal Module (i.e. @Command)
 */
@Injectable()
export abstract class Marshal {
    private readonly _logger = new Logger(Marshal.name);

    constructor(
        cms: CommandManagerService,
        protected readonly gqlService: GqlService,
        protected readonly analyticsService: AnalyticsService,
        protected readonly embedService: EmbedService,
    ) {
        this.registerAllCommands(cms);
        this.registerAllCommandNotFoundHooks(cms);
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
}
