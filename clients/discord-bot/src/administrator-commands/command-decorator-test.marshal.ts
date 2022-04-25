import {Message} from "discord.js";

import {
    Command, Marshal, MarshalCommandContext,
} from "../marshal";

export class CommandDecoratorTestMarshal extends Marshal {

    @Command({
        name: "test",
        aliases: ["t"],
        args: [
            {
                name: "stringArg",
                type: "string",
                docs: "A test string argument",
            },
        ],
        docs: "Command to test `@Command` decorator",
    })
    async test(m: Message, c: MarshalCommandContext): Promise<void> {
        const {args} = c;
        
        await m.reply(`\`\`\`${JSON.stringify(args, null, 2)}\`\`\``);
    }

    @Command({
        name: "test",
        aliases: ["t2", "t22"],
        args: [
            {
                name: "stringArg",
                type: "string",
                docs: "A test string argument",
            },
            {
                name: "numberArg",
                type: "number",
                docs: "A test number argument",
            },
        ],
        docs: "Command to test `@Command` decorator",
    })
    async testMoreArgs(m: Message, c: MarshalCommandContext): Promise<void> {
        const {args} = c;
        
        await m.reply(`\`\`\`${JSON.stringify(args, null, 2)}\`\`\``);
    }

}
