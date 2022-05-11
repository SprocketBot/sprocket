import {
    Process, Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {ScrimStatus} from "@sprocketbot/common";
import {Job} from "bull";

import {MemberRestrictionType} from "../database";
import {MemberService} from "../organization/member/member.service";
import {MemberRestrictionService} from "../organization/member-restriction";
import {ScrimService} from "./scrim.service";

@Processor("scrim")
export class ScrimConsumer {
    private readonly logger = new Logger(ScrimConsumer.name);

    constructor(
        private readonly scrimService: ScrimService,
        private readonly memberRestrictionService: MemberRestrictionService,
        private readonly memberService: MemberService,
    ) {}

    @Process({name: "timeoutQueue"})
    async timeoutQueue(job: Job<string>): Promise<void> {
        const scrimId = job.data;
        const scrim = await this.scrimService.getScrimById(scrimId);
        
        if (scrim?.status !== ScrimStatus.POPPED) return;

        const playersNotCheckedIn = scrim.players.filter(p => !p.checkedIn);

        this.logger.debug(`scrim unsuccessful scrimId=${scrimId}`);
        this.logger.debug(`scrimId=${scrimId} players didn't check in: ${playersNotCheckedIn.map(p => p.name)}`);

        const bannedUntil = new Date();
        bannedUntil.setHours(bannedUntil.getHours() + 24);

        for (const player of playersNotCheckedIn) {
            const member = await this.memberService.getMember({where: {user: {id: player.id} } });
            await this.memberRestrictionService.createMemberRestriction(MemberRestrictionType.QUEUE_BAN, bannedUntil, member.id);
        }

        await this.scrimService.cancelScrim(scrimId);
    }
}
