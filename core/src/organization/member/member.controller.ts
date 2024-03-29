import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {GetMemberResponse} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {MemberRepository} from "../database/member.repository";

@Controller("user")
export class MemberController {
    constructor(private readonly memberRepository: MemberRepository) {}

    @MessagePattern(CoreEndpoint.GetMember)
    async getMember(@Payload() payload: unknown): Promise<GetMemberResponse> {
        const data = CoreSchemas.GetMember.input.parse(payload);
        return this.memberRepository.findById(data, {
            relations: ["user", "organization"],
        });
    }
}
