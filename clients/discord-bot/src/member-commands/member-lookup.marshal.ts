import {Logger} from "@nestjs/common";
import {UserAuthenticationAccountType} from "@sprocketbot/common";
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
        const accountType = UserAuthenticationAccountType.DISCORD;
        const accountId = c.args.accountId as string;

        const res = await this.gqlService.query({
            getUserByAuthAccount: [
                {accountType, accountId},
                {id: true},
            ],
        });

        await m.reply(res.getUserByAuthAccount?.id ?? "No user found");
    }
}
