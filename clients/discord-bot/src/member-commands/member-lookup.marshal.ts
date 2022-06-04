import {Logger} from "@nestjs/common";
import {
    CoreEndpoint, ResponseStatus,
} from "@sprocketbot/common";
import {Message} from "discord.js";

import {
    Command, Marshal, MarshalCommandContext,
} from "../marshal";

export class MemberLookupMarshal extends Marshal {

    private readonly logger = new Logger(MemberLookupMarshal.name);

    @Command({
        name: "lookupMember",
        docs: "Checks if you are in the organization",
        args: [],
    })
    async memberLookupSelf(m: Message, c: MarshalCommandContext): Promise<void> {
        if (c.author) {
            await m.reply(`You are attempting to look up \`${JSON.stringify(c.author)}\``);
        } else {
            await m.reply(`You are not in this organization 😞`);
        }
    }

    @Command({
        name: "getUserByAuthAccount",
        docs: "Finds a user by their Discord ID",
        args: [
            {
                name: "accountId",
                type: "string",
                docs: "The account ID to look up",
            },
        ],
    })
    async getUserByAuthAccount(m: Message, c: MarshalCommandContext): Promise<void> {
        const accountId = c.args.accountId as string;

        const response = await this.coreService.send(CoreEndpoint.GetUserByAuthAccount, {
            accountId: accountId,
            accountType: "DISCORD",
        });
        if (response.status === ResponseStatus.ERROR) {
            await m.reply("No user found");
            return;
        }
        await m.reply(response.data.id.toString());
    }
}
