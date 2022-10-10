import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {GetMemberResponse} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {MemberService} from "./member.service";

@Controller("user")
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @MessagePattern(CoreEndpoint.GetMember)
    async getMember(@Payload() payload: unknown): Promise<GetMemberResponse> {
        const data = CoreSchemas.GetMember.input.parse(payload);
        return this.memberService.getMemberById(data, {
            relations: ["user", "organization"],
        });
    }
}
