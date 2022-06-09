import {Injectable, Logger} from "@nestjs/common";

import type {LinkedEventMeta} from "./events.types";

@Injectable()
export class EventManagerService {
    private static readonly COMMAND_ARG_KEY_SEP = "__";

    /**
     * List of all registered commands/aliases
     */
    private _events: LinkedEventMeta[] = [];

    private readonly _logger = new Logger(EventManagerService.name);

    /**
     * Gets all non-alias command specs. Useful when displaying command metadata
     * to users. Should not be used for executing a command, instead use {@link handleMessage}.
     */
    get events(): LinkedEventMeta[] {
        const values = [...this._events.values()];
        return values;
    }

    /**
     * Registers a command so that it can be called by discord messages
     */
    registerEvent(meta: LinkedEventMeta): void {
        this._events.push(meta);
    }
}
