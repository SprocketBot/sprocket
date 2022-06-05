import {
    Process, Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {ScrimStatus} from "@sprocketbot/common";
import {Job} from "bull";
import {add} from "date-fns";
import {IsNull, MoreThanOrEqual} from "typeorm";

import {OrganizationConfigurationService} from "../configuration/organization-configuration/organization-configuration.service";
import {MemberRestrictionType, OrganizationConfigurationKeyCode} from "../database";
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
        private readonly organizationConfigurationService: OrganizationConfigurationService,
    ) {}

    @Process({name: "timeoutQueue"})
    async timeoutQueue(job: Job<string>): Promise<void> {
        const scrimId = job.data;
        const scrim = await this.scrimService.getScrimById(scrimId);

        if (scrim?.status !== ScrimStatus.POPPED) return;

        const playersNotCheckedIn = scrim.players.filter(p => !p.checkedIn);

        this.logger.log(`scrim unsuccessful scrimId=${scrimId}`);
        this.logger.log(`scrimId=${scrimId} players didn't check in: ${playersNotCheckedIn.map(p => p.name)}`);

        const initialBanDuration = await this.organizationConfigurationService.getOrganizationConfigurationValue(scrim.organizationId, OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES);
        const durationModifier = await this.organizationConfigurationService.getOrganizationConfigurationValue(scrim.organizationId, OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_DURATION_MODIFIER);
        const restrictionFallOffDays = await this.organizationConfigurationService.getOrganizationConfigurationValue(scrim.organizationId, OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS);

        for (const player of playersNotCheckedIn) {
            const member = await this.memberService.getMember({relations: ["organization"], where: {user: {id: player.id} } });
            const restrictions = await this.memberRestrictionService.getMemberRestrictions({
                where: {
                    type: MemberRestrictionType.QUEUE_BAN,
                    member: member,
                    manualExpiration: IsNull(),
                    expiration: MoreThanOrEqual(add(new Date(), {days: -parseInt(restrictionFallOffDays)}).toUTCString()),
                },
            });

            // eslint-disable-next-line @typescript-eslint/no-extra-parens
            const banMinuteOffset = parseInt(initialBanDuration) + (parseFloat(durationModifier) * restrictions.length);
            
            await this.memberRestrictionService.createMemberRestriction(
                MemberRestrictionType.QUEUE_BAN,
                add(new Date(), {minutes: banMinuteOffset}),
                "Failed to check-in to scrim",
                member.id,
            );
        }

        await this.scrimService.cancelScrim(scrimId);
    }
}
