import type {SprocketConfigurationKey} from "@sprocketbot/common";
import {CoreEndpoint, ResponseStatus} from "@sprocketbot/common";
import {Message} from "discord.js";

import {Command, Marshal, MarshalCommandContext} from "../../marshal";
import {table} from "../../util/table";

export class SprocketConfigurationMarshal extends Marshal {
    @Command({
        name: "getSprocketConfig",
        args: [
            {
                name: "key",
                type: "string",
                docs: "The key to look up a sprocket_configuration value by",
            },
        ],
        docs: "Gets the value of a sprocket_configuration row by its key",
    })
    async getSprocketConfig(
        m: Message,
        context: MarshalCommandContext,
    ): Promise<void> {
        const key = context.args.key as SprocketConfigurationKey;

        const result = await this.coreService.send(
            CoreEndpoint.GetSprocketConfiguration,
            {
                key,
            },
        );
        if (result.status === ResponseStatus.ERROR) throw result.error;

        const arr = result.data.map(c => [c.key, c.value]);
        const t = table(arr, ["key", "value"]);
        await m.reply(`\`\`\`${t}\`\`\``);
    }
}
