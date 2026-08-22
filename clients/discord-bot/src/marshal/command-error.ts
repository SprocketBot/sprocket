import {Logger} from "@nestjs/common";
import {randomUUID} from "crypto";
import type {Message} from "discord.js";

export type CommandErrorType = "UserError" | "InternalError" | "UnknownError";

export class CommandError extends Error {
    name = CommandError.name;

    private logger = new Logger(CommandError.name);

    private id: string;

    constructor(private type: CommandErrorType, private cause?: string, private resolution?: string) {
        super(cause);

        let uuid = randomUUID();
        uuid = uuid.slice(uuid.length - 5, uuid.length);

        let ms = new Date().getUTCMilliseconds()
            .toString();
        ms = ms.slice(ms.length - 3, ms.length);

        this.id = uuid + ms;
    }

    async replyTo(m: Message): Promise<void> {
        let response: string;

        if (this.type === "UnknownError") {
            response = "An unknown error occurred, please contact a developer"; // TODO this could direct people to #bot-support
        } else {
            response = `An error occurred because ${this.cause}.${
                this.resolution ? ` Please ${this.resolution}` : ""
            }`;
        }

        await m.reply(`${response} (Code ${this.id}).`);
    }

    log(): void {
        this.logger.error(
            {
                name: this.name,
                type: this.type,
                cause: this.cause,
                resolution: this.resolution,
                id: this.id,
            },
            this.stack,
        );
    }
}
