import {Logger} from "@nestjs/common";
import {UserAuthenticationAccountType} from "@sprocketbot/common";
import {Message} from "discord.js";
import {
    Command, Marshal, MarshalCommandContext,
} from "src/marshal";

export class UserRegistrationMarshal extends Marshal {
    private readonly logger = new Logger(UserRegistrationMarshal.name);
    
    @Command({
        name: "register",
        docs: "Registers yourself in the organization",
        longDocs: "Registers yourself in the organization using your Discord account",
        args: [],
    })
    async registerUser(m: Message, c: MarshalCommandContext): Promise<void> {
        if (!c.author) {
            const res = await this.gqlService.mutation({
                registerUser: [
                    {
                        accountType: UserAuthenticationAccountType.DISCORD,
                        accountId: m.author.id,
                    }, {
                        id: true,
                    },
                ],
            });
            
            await m.reply(`You have been registered! (\`user.id=${res.registerUser.id}\`)`);
        } else {
            await m.reply(`You are already registered! (\`user.id=${c.author.id}\`)`);
        }
        
    }
}
